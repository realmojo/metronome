import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-1963334904140891/6754025890";

const CHORDS_PRESETS_STORAGE_KEY = "@chords:presets";

type ChordsPreset = {
  id: string;
  name: string;
  bpm: number;
  notes: string[];
  chords: string[];
  tensions: string[];
  createdAt: number;
};

export default function ChordsPlayScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // 쿼리 파라미터에서 설정값 가져오기
  const [bpm, setBpm] = useState(
    params.bpm ? parseInt(params.bpm as string, 10) : 120
  );
  const [notes, setNotes] = useState<string[]>(
    params.notes ? (params.notes as string).split(",") : []
  );
  const [chords, setChords] = useState<string[]>(
    params.chords ? (params.chords as string).split(",") : []
  );
  const [tensions, setTensions] = useState<string[]>(
    params.tensions ? (params.tensions as string).split(",") : []
  );
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [presets, setPresets] = useState<ChordsPreset[]>([]);

  const textColor = Colors.dark.text;
  const tintColor = Colors.dark.tint;
  const borderColor = "#333";

  // 4/4 박자 고정
  const beatPerBar = 4;
  const [currentBeat, setCurrentBeat] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 노트 정리 함수 (Db(C#) -> Db)
  const normalizeNote = (note: string) => {
    if (note.includes("(")) {
      return note.split("(")[0];
    }
    return note;
  };

  // 코드 타입별 사용 가능한 텐션 정의
  const getAvailableTensionsForChord = (chord: string): string[] => {
    const chordLower = chord.toLowerCase();

    // 텐션을 사용할 수 없는 코드 타입
    if (
      chordLower.includes("dim7") ||
      chordLower.includes("mm7") ||
      chordLower.includes("aug7") ||
      chordLower.includes("sus4")
    ) {
      return [];
    }

    if (chordLower.includes("M7")) {
      // M7: 9, 13 사용 가능 (11 불가, #11은 특수 케이스이지만 일반적으로는 9, 13)
      return ["b9", "9", "#9", "13"];
    } else if (chordLower.includes("m7")) {
      // m7: 9, 11 사용 가능 (13 불가)
      return ["b9", "9", "#9", "11"];
    } else if (chordLower === "7") {
      // 7: 9, 13 사용 가능 (11 불가)
      return ["b9", "9", "#9", "13"];
    }

    // 기본값: 텐션 사용 불가
    return [];
  };

  // 텐션 그룹 정의
  const TENSION_GROUPS = [
    { name: "9", tensions: ["b9", "9", "#9"] },
    { name: "11", tensions: ["11", "#11"] },
    { name: "13", tensions: ["b13", "13"] },
  ];

  // 텐션 선택 함수 (코드 타입에 따라 사용 가능한 텐션만 선택)
  const selectTensions = (availableTensions: string[], chord: string) => {
    const selected: string[] = [];

    // 코드 타입에 따라 사용 가능한 텐션 필터링
    const allowedTensionsForChord = getAvailableTensionsForChord(chord);
    const filteredTensions = availableTensions.filter((t) =>
      allowedTensionsForChord.includes(t)
    );

    TENSION_GROUPS.forEach((group) => {
      // 해당 그룹의 텐션 중에서 코드에 사용 가능하고 선택된 것만 필터링
      const availableInGroup = group.tensions.filter((t) =>
        filteredTensions.includes(t)
      );

      // 그룹에서 선택된 텐션이 있으면 랜덤으로 1개 선택
      if (availableInGroup.length > 0) {
        const randomTension =
          availableInGroup[Math.floor(Math.random() * availableInGroup.length)];
        selected.push(randomTension);
      }
    });

    return selected;
  };

  // 랜덤 코드 생성 함수
  const generateRandomChords = () => {
    if (notes.length === 0 || chords.length === 0) {
      return null;
    }

    // A Form (현재 코드)
    const noteA = normalizeNote(
      notes[Math.floor(Math.random() * notes.length)]
    );
    const chordA = chords[Math.floor(Math.random() * chords.length)];
    const selectedTensionsA =
      tensions.length > 0 ? selectTensions(tensions, chordA) : [];

    // B Form (다음 코드)
    const noteB = normalizeNote(
      notes[Math.floor(Math.random() * notes.length)]
    );
    const chordB = chords[Math.floor(Math.random() * chords.length)];
    const selectedTensionsB =
      tensions.length > 0 ? selectTensions(tensions, chordB) : [];

    return {
      a: {
        note: noteA,
        chord: chordA,
        tensions: selectedTensionsA,
      },
      b: {
        note: noteB,
        chord: chordB,
        tensions: selectedTensionsB,
      },
    };
  };

  // 랜덤 코드 상태
  const [randomChords, setRandomChords] = useState<{
    a: { note: string; chord: string; tensions: string[] };
    b: { note: string; chord: string; tensions: string[] };
  } | null>(null);

  // 프리셋 목록 로드
  useEffect(() => {
    loadPresets();
  }, []);

  // 초기 코드 생성
  useEffect(() => {
    setRandomChords(generateRandomChords());
  }, [notes, chords, tensions]);

  // 프리셋 목록 불러오기
  const loadPresets = async () => {
    try {
      const data = await AsyncStorage.getItem(CHORDS_PRESETS_STORAGE_KEY);
      if (data) {
        const parsedPresets = JSON.parse(data) as ChordsPreset[];
        const sortedPresets = parsedPresets.sort(
          (a, b) => b.createdAt - a.createdAt
        );
        setPresets(sortedPresets);
      }
    } catch (error) {
      console.error("Failed to load presets:", error);
    }
  };

  // 프리셋 불러오기
  const loadPreset = (preset: ChordsPreset) => {
    setBpm(preset.bpm);
    setNotes(preset.notes);
    setChords(preset.chords);
    setTensions(preset.tensions);
    setShowPresetsModal(false);
    // 설정 화면으로 이동하여 업데이트된 설정 확인
    router.replace({
      pathname: "/chords-play",
      params: {
        bpm: preset.bpm.toString(),
        notes: preset.notes.join(","),
        chords: preset.chords.join(","),
        tensions: preset.tensions.join(","),
      },
    } as any);
  };

  // BPM에 맞춰 비트 표시 및 코드 변경
  useEffect(() => {
    const beatInterval = 60000 / bpm; // 비트 간격 (밀리초)

    // 첫 번째 비트 즉시 표시
    setCurrentBeat(0);

    // 두 번째 비트부터 interval로 진행
    intervalRef.current = setInterval(() => {
      setCurrentBeat((prev) => {
        const nextBeat = (prev + 1) % beatPerBar;
        // 한 바퀴가 완료되면 (0이 되면) 코드 업데이트
        if (nextBeat === 0) {
          setRandomChords((current) => {
            if (!current) return generateRandomChords();
            // 하단 코드(B Form)를 중간으로, 새로운 코드를 하단으로
            const newChord = generateRandomChords();
            if (!newChord) return current;
            return {
              a: current.b, // 하단 코드를 중간으로 이동
              b: newChord.b, // 새로운 코드를 하단에 배치
            };
          });
        }
        return nextBeat;
      });
    }, beatInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bpm, beatPerBar, notes, chords, tensions]);

  // 헤더에 설정 버튼 추가
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => setShowPresetsModal(true)}
            style={styles.headerButton}
          >
            <MaterialIcons name="bookmark" size={24} color={Colors.dark.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/chords")}
            style={styles.headerButton}
          >
            <MaterialIcons name="settings" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, router]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* BPM 표시 */}
          <View style={styles.bpmSection}>
            <ThemedText
              type="title"
              style={[styles.bpmValue, { color: tintColor }]}
            >
              {bpm}
            </ThemedText>
          </View>

          {/* 비트 표시 */}
          <View style={styles.beatSection}>
            <View style={styles.beatDots}>
              {Array.from({ length: beatPerBar }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.beatDot,
                    {
                      backgroundColor:
                        index === currentBeat ? tintColor : borderColor,
                      opacity: index === currentBeat ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {randomChords ? (
            <>
              {/* 중간: 현재 코드 (A Form) */}
              <View style={styles.chordSection}>
                <ThemedText style={[styles.tensionText, { color: textColor }]}>
                  {randomChords.a.tensions.length > 0
                    ? randomChords.a.tensions.join(" ")
                    : ""}
                </ThemedText>
                <ThemedText
                  style={[styles.chordName, { color: textColor }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {randomChords.a.note}
                  {randomChords.a.chord}
                </ThemedText>
              </View>

              {/* 하단: 다음 코드 (B Form) */}
              <View style={[styles.chordSection, styles.chordSectionSecondary]}>
                <ThemedText
                  style={[
                    styles.tensionText,
                    styles.secondaryText,
                    { color: textColor },
                  ]}
                >
                  {randomChords.b.tensions.length > 0
                    ? randomChords.b.tensions.join(" ")
                    : ""}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.chordName,
                    styles.secondaryText,
                    { color: textColor },
                  ]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {randomChords.b.note}
                  {randomChords.b.chord}
                </ThemedText>
              </View>
            </>
          ) : (
            <ThemedText style={[styles.description, { color: textColor }]}>
              설정을 확인해주세요.
            </ThemedText>
          )}
        </View>
      </ScrollView>
      {/* 하단 광고 */}
      {Platform.OS !== "web" && (
        <View
          style={[
            styles.adContainer,
            {
              paddingBottom: Platform.OS === "android" ? insets.bottom + 8 : 8,
            },
          ]}
        >
          <BannerAd
            unitId={AD_UNIT_ID}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => {
              console.error("Ad failed to load:", error);
            }}
          />
        </View>
      )}

      {/* 프리셋 목록 모달 */}
      <Modal
        visible={showPresetsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPresetsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPresetsModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              styles.presetsModalContent,
              { backgroundColor: Colors.dark.background, borderColor },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText
                type="subtitle"
                style={[styles.modalTitle, { color: textColor }]}
              >
                Presets
              </ThemedText>
              <Pressable
                onPress={() => setShowPresetsModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={textColor} />
              </Pressable>
            </View>
            {presets.length === 0 ? (
              <View style={styles.emptyPresets}>
                <ThemedText style={[styles.emptyText, { color: textColor }]}>
                  No presets saved
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.presetsList}>
                {presets.map((preset) => (
                  <View
                    key={preset.id}
                    style={[styles.presetItem, { borderColor }]}
                  >
                    <Pressable
                      onPress={() => loadPreset(preset)}
                      style={styles.presetItemContent}
                    >
                      <View style={styles.presetInfo}>
                        <ThemedText
                          style={[styles.presetName, { color: textColor }]}
                        >
                          {preset.name}
                        </ThemedText>
                        <ThemedText
                          style={[styles.presetDetails, { color: textColor }]}
                        >
                          BPM: {preset.bpm} | Notes: {preset.notes.length} |
                          Chords: {preset.chords.length} | Tensions:{" "}
                          {preset.tensions.length}
                        </ThemedText>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  content: {
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100%",
    paddingTop: 40,
    paddingBottom: 40,
    gap: 40,
  },
  bpmSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  bpmLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  bpmValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  beatSection: {
    width: "100%",
    alignItems: "center",
  },
  beatDots: {
    flexDirection: "row",
    width: "100%",
    gap: 4,
  },
  beatDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    minWidth: 0,
  },
  chordSection: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 150,
    width: "100%",
    paddingVertical: 20,
  },
  chordSectionSecondary: {
    opacity: 0.6,
  },
  tensionText: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 8,
  },
  chordName: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    minHeight: 60,
    lineHeight: 60,
  },
  formText: {
    fontSize: 14,
    fontWeight: "400",
  },
  secondaryText: {
    opacity: 0.6,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  adContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.background,
    paddingTop: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 300,
    maxHeight: "60%",
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  presetsModalContent: {
    width: "85%",
    maxWidth: 400,
    maxHeight: "70%",
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  emptyPresets: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  presetsList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  presetItem: {
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  presetItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  presetInfo: {
    flex: 1,
    marginRight: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  presetDetails: {
    fontSize: 12,
    opacity: 0.7,
  },
});
