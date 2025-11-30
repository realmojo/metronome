import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
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

const MIN_BPM = 30;
const MAX_BPM = 300;
const DEFAULT_BPM = 80;
const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-1963334904140891/6754025890";

const NOTES = [
  "C",
  "Db(C#)",
  "D",
  "Eb(D#)",
  "E",
  "F",
  "Gb(F#)",
  "G",
  "Ab(G#)",
  "A",
  "Bb(A#)",
  "B",
];
const CHORDS = ["M7", "m7", "7", "m7(b5)", "dim7", "mM7", "aug7", "sus4"];
// const FORMS = ["A Form", "B Form"];

// 텐션 그룹 정의
const TENSION_GROUPS = [
  { name: "9", tensions: ["b9", "9", "#9"] },
  { name: "11", tensions: ["11", "#11"] },
  { name: "13", tensions: ["b13", "13"] },
];

const CHORDS_SETTINGS_STORAGE_KEY = "@chords:settings";
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

export default function ChordsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [selectedNotes, setSelectedNotes] = useState<string[]>(NOTES);
  const [selectedChords, setSelectedChords] = useState<string[]>(CHORDS);
  // const [selectedForms, setSelectedForms] = useState<string[]>(FORMS);
  const [selectedTensions, setSelectedTensions] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<ChordsPreset[]>([]);

  const backgroundColor = Colors.dark.background;
  const textColor = Colors.dark.text;
  const tintColor = Colors.dark.tint;
  const borderColor = "#333";

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const toggleChord = (chord: string) => {
    setSelectedChords((prev) =>
      prev.includes(chord) ? prev.filter((c) => c !== chord) : [...prev, chord]
    );
  };

  // const toggleForm = (form: string) => {
  //   setSelectedForms((prev) =>
  //     prev.includes(form) ? prev.filter((f) => f !== form) : [...prev, form]
  //   );
  // };

  const toggleTension = (tension: string) => {
    setSelectedTensions((prev) =>
      prev.includes(tension)
        ? prev.filter((t) => t !== tension)
        : [...prev, tension]
    );
  };

  const adjustBpm = (delta: number) => {
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + delta)));
  };

  // 프리셋 목록 로드
  useEffect(() => {
    loadPresets();
  }, []);

  // 헤더에 버튼 추가
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setShowPresetsModal(true)}
          style={styles.headerButton}
        >
          <MaterialIcons name="bookmark" size={24} color={Colors.dark.text} />
        </Pressable>
      ),
    });
  }, [navigation]);

  // 프리셋 목록 불러오기
  const loadPresets = async () => {
    try {
      const data = await AsyncStorage.getItem(CHORDS_PRESETS_STORAGE_KEY);
      if (data) {
        const parsedPresets = JSON.parse(data) as ChordsPreset[];
        // 최신순으로 정렬
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
    setSelectedNotes(preset.notes);
    setSelectedChords(preset.chords);
    setSelectedTensions(preset.tensions);
    setShowPresetsModal(false);
  };

  // 프리셋 삭제
  const deletePreset = async (id: string) => {
    try {
      const updatedPresets = presets.filter((p) => p.id !== id);
      await AsyncStorage.setItem(
        CHORDS_PRESETS_STORAGE_KEY,
        JSON.stringify(updatedPresets)
      );
      setPresets(updatedPresets);
    } catch (error) {
      console.error("Failed to delete preset:", error);
    }
  };

  // 프리셋 저장
  const savePreset = async () => {
    if (!presetName.trim()) {
      return;
    }

    try {
      const newPreset: ChordsPreset = {
        id: Date.now().toString(),
        name: presetName.trim(),
        bpm,
        notes: selectedNotes,
        chords: selectedChords,
        tensions: selectedTensions,
        createdAt: Date.now(),
      };

      // 기존 프리셋 불러오기
      const data = await AsyncStorage.getItem(CHORDS_PRESETS_STORAGE_KEY);
      const existingPresets = data ? (JSON.parse(data) as ChordsPreset[]) : [];

      // 새 프리셋 추가
      const updatedPresets = [newPreset, ...existingPresets];
      await AsyncStorage.setItem(
        CHORDS_PRESETS_STORAGE_KEY,
        JSON.stringify(updatedPresets)
      );

      setPresets(updatedPresets);
      setPresetName("");
      setShowSaveModal(false);
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  const handleStart = async () => {
    // 최소 하나 이상 선택되어 있는지 확인
    if (
      selectedNotes.length === 0 ||
      selectedChords.length === 0
      // selectedForms.length === 0
    ) {
      // TODO: 에러 메시지 표시
      return;
    }

    try {
      const settings = {
        bpm,
        notes: selectedNotes,
        chords: selectedChords,
        // forms: selectedForms,
        tensions: selectedTensions,
      };

      // 설정 저장
      await AsyncStorage.setItem(
        CHORDS_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );

      // 다음 화면으로 이동 (설정값을 쿼리 파라미터로 전달)
      router.push({
        pathname: "/chords-play",
        params: {
          bpm: bpm.toString(),
          notes: selectedNotes.join(","),
          chords: selectedChords.join(","),
          // forms: selectedForms.join(","),
          tensions: selectedTensions.join(","),
        },
      } as any);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* BPM 설정 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              BPM
            </ThemedText>
            <View style={styles.bpmControls}>
              <Pressable
                onPress={() => adjustBpm(-1)}
                style={[styles.bpmButton, { borderColor }]}
              >
                <MaterialIcons name="remove" size={24} color={textColor} />
              </Pressable>
              <ThemedText
                type="title"
                style={[styles.bpmValue, { color: tintColor }]}
              >
                {bpm}
              </ThemedText>
              <Pressable
                onPress={() => adjustBpm(1)}
                style={[styles.bpmButton, { borderColor }]}
              >
                <MaterialIcons name="add" size={24} color={textColor} />
              </Pressable>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={MIN_BPM}
                maximumValue={MAX_BPM}
                value={bpm}
                onValueChange={(value) => setBpm(Math.round(value))}
                minimumTrackTintColor={tintColor}
                maximumTrackTintColor={borderColor}
                thumbTintColor={tintColor}
                step={1}
              />
            </View>
            <View style={styles.bpmRange}>
              <ThemedText style={[styles.bpmRangeText, { color: textColor }]}>
                {MIN_BPM}
              </ThemedText>
              <ThemedText style={[styles.bpmRangeText, { color: textColor }]}>
                {MAX_BPM}
              </ThemedText>
            </View>
          </View>

          {/* Notes 설정 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Notes
            </ThemedText>
            <View style={styles.optionsGrid}>
              {NOTES.map((note) => {
                const isSelected = selectedNotes.includes(note);
                return (
                  <Pressable
                    key={note}
                    onPress={() => toggleNote(note)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected
                          ? tintColor
                          : backgroundColor,
                        borderColor: isSelected ? tintColor : borderColor,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        {
                          color: isSelected ? backgroundColor : textColor,
                        },
                      ]}
                    >
                      {note}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Chords 설정 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Chords
            </ThemedText>
            <View style={styles.optionsGrid}>
              {CHORDS.map((chord) => {
                const isSelected = selectedChords.includes(chord);
                return (
                  <Pressable
                    key={chord}
                    onPress={() => toggleChord(chord)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected
                          ? tintColor
                          : backgroundColor,
                        borderColor: isSelected ? tintColor : borderColor,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        {
                          color: isSelected ? backgroundColor : textColor,
                        },
                      ]}
                    >
                      {chord}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Forms 설정 */}
          {/* <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Forms
            </ThemedText>
            <View style={styles.optionsGrid}>
              {FORMS.map((form) => {
                const isSelected = selectedForms.includes(form);
                return (
                  <Pressable
                    key={form}
                    onPress={() => toggleForm(form)}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected
                          ? tintColor
                          : backgroundColor,
                        borderColor: isSelected ? tintColor : borderColor,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        {
                          color: isSelected ? backgroundColor : textColor,
                        },
                      ]}
                    >
                      {form}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View> */}

          {/* Tension 설정 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Tension
            </ThemedText>
            {TENSION_GROUPS.map((group) => (
              <View key={group.name} style={styles.tensionGroup}>
                <View style={styles.optionsGrid}>
                  {group.tensions.map((tension) => {
                    const isSelected = selectedTensions.includes(tension);
                    return (
                      <Pressable
                        key={tension}
                        onPress={() => toggleTension(tension)}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: isSelected
                              ? tintColor
                              : backgroundColor,
                            borderColor: isSelected ? tintColor : borderColor,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.optionButtonText,
                            {
                              color: isSelected ? backgroundColor : textColor,
                            },
                          ]}
                        >
                          {tension}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* 버튼 컨테이너 */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => setShowSaveModal(true)}
          style={[
            styles.saveButton,
            styles.secondaryButton,
            { borderColor: tintColor },
          ]}
        >
          <MaterialIcons name="save" size={20} color={tintColor} />
          <ThemedText style={[styles.saveButtonText, { color: tintColor }]}>
            Save
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleStart}
          style={[styles.saveButton, { backgroundColor: tintColor }]}
        >
          <MaterialIcons name="play-arrow" size={24} color={backgroundColor} />
          <ThemedText
            style={[styles.saveButtonText, { color: backgroundColor }]}
          >
            Start
          </ThemedText>
        </Pressable>
      </View>
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

      {/* 저장 모달 */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSaveModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor, borderColor }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText
              type="subtitle"
              style={[styles.modalTitle, { color: textColor }]}
            >
              프리셋 저장
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: borderColor, color: textColor, borderColor },
              ]}
              placeholder="프리셋 이름을 입력하세요"
              placeholderTextColor={textColor + "80"}
              value={presetName}
              onChangeText={setPresetName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowSaveModal(false);
                  setPresetName("");
                }}
                style={[
                  styles.modalButton,
                  styles.modalButtonCancel,
                  { borderColor },
                ]}
              >
                <ThemedText
                  style={[styles.modalButtonText, { color: textColor }]}
                >
                  취소
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={savePreset}
                style={[
                  styles.modalButton,
                  styles.modalButtonSave,
                  { backgroundColor: tintColor },
                ]}
              >
                <ThemedText
                  style={[styles.modalButtonText, { color: backgroundColor }]}
                >
                  저장
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
              { backgroundColor, borderColor },
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
                      <Pressable
                        onPress={() => deletePreset(preset.id)}
                        style={styles.deleteButton}
                      >
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color="#ff4444"
                        />
                      </Pressable>
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
    gap: 32,
  },
  section: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  bpmControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  bpmButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bpmValue: {
    fontSize: 24,
    fontWeight: "bold",
    minWidth: 100,
    textAlign: "center",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  bpmRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  bpmRangeText: {
    fontSize: 12,
  },
  tensionGroup: {
    marginBottom: 8,
  },
  tensionGroupLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.dark.background,
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  textInput: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonSave: {
    // backgroundColor is set inline
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  presetsModalContent: {
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  deleteButton: {
    padding: 8,
  },
  adContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.background,
    paddingTop: 8,
  },
});
