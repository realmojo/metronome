import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MetronomeHeaderButtons } from "@/components/metronome-header-buttons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useNavigation } from "expo-router";

const MIN_BPM = 20;
const MAX_BPM = 300;
const DEFAULT_BPM = 120;
const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "ios"
  ? "ca-app-pub-9130836798889522/5633395195"
  : "ca-app-pub-9130836798889522/3277174687";

const TEMPO_MARKINGS = [
  { name: "Larghissimo", nameKo: "라르기시모", bpm: 24 },
  { name: "Grave", nameKo: "그라베", bpm: 35 },
  { name: "Lento", nameKo: "렌토", bpm: 50 },
  { name: "Largo", nameKo: "라르고", bpm: 50 },
  { name: "Larghetto", nameKo: "라르겟토", bpm: 63 },
  { name: "Adagio", nameKo: "아다지오", bpm: 71 },
  { name: "Adagietto", nameKo: "아다지에토", bpm: 75 },
  { name: "Andante", nameKo: "안단테", bpm: 92 },
  { name: "Andantino", nameKo: "안단티노", bpm: 94 },
  { name: "Moderato", nameKo: "모데라토", bpm: 114 },
  { name: "Allegretto", nameKo: "알레그레토", bpm: 116 },
  { name: "Allegro", nameKo: "알레그로", bpm: 144 },
  { name: "Vivace", nameKo: "비바체", bpm: 166 },
  { name: "Presto", nameKo: "프레스토", bpm: 184 },
  { name: "Prestissimo", nameKo: "프레스티시모", bpm: 200 },
];

type MetronomePreset = {
  id: string;
  name: string;
  bpm: number;
  beatPerBar: number;
  clickPerBeat: number;
  tempoName: string;
  createdAt: number;
};

const PRESETS_STORAGE_KEY = "@metronome:presets";

export default function MetronomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatPerBar, setBeatPerBar] = useState(4);
  const [clickPerBeat, setClickPerBeat] = useState(1);
  const [selectedTempo, setSelectedTempo] = useState(TEMPO_MARKINGS[11]); // 기본값: Allegro
  const [currentBeat, setCurrentBeat] = useState(0);
  const [showBeatPerBarOptions, setShowBeatPerBarOptions] = useState(false);
  const [showClickPerBeatOptions, setShowClickPerBeatOptions] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<MetronomePreset[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatPlayer = useAudioPlayer(require("@/assets/sounds/sound-1.mp3")); // Beat/bar 소리
  const clickPlayer = useAudioPlayer(require("@/assets/sounds/sound-3.mp3")); // Click/beat 소리

  // 드래그 제스처를 위한 값들
  const translateY = useSharedValue(0);
  const currentBpmRef = useRef(bpm);

  // BPM이 변경될 때마다 ref 업데이트
  useEffect(() => {
    currentBpmRef.current = bpm;
  }, [bpm]);

  // 프리셋 목록 로드
  useEffect(() => {
    loadPresets();
  }, []);

  // 헤더에 버튼 추가
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MetronomeHeaderButtons
          onSavePress={() => setShowSaveModal(true)}
          onPresetsPress={() => setShowPresetsModal(true)}
        />
      ),
    });
  }, [navigation]);

  // 프리셋 목록 불러오기
  const loadPresets = async () => {
    try {
      const data = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (data) {
        const parsedPresets = JSON.parse(data) as MetronomePreset[];
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

  // 프리셋 저장
  const savePreset = async () => {
    if (!presetName.trim()) {
      return;
    }

    try {
      const newPreset: MetronomePreset = {
        id: Date.now().toString(),
        name: presetName.trim(),
        bpm,
        beatPerBar,
        clickPerBeat,
        tempoName: selectedTempo.name,
        createdAt: Date.now(),
      };

      const updatedPresets = [newPreset, ...presets];
      await AsyncStorage.setItem(
        PRESETS_STORAGE_KEY,
        JSON.stringify(updatedPresets)
      );
      setPresets(updatedPresets);
      setPresetName("");
      setShowSaveModal(false);
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  // 프리셋 불러오기
  const loadPreset = (preset: MetronomePreset) => {
    setBpm(preset.bpm);
    setBeatPerBar(preset.beatPerBar);
    setClickPerBeat(preset.clickPerBeat);
    const tempo = TEMPO_MARKINGS.find((t) => t.name === preset.tempoName);
    if (tempo) {
      setSelectedTempo(tempo);
    }
    setShowPresetsModal(false);
  };

  // 프리셋 삭제
  const deletePreset = async (id: string) => {
    try {
      const updatedPresets = presets.filter((p) => p.id !== id);
      await AsyncStorage.setItem(
        PRESETS_STORAGE_KEY,
        JSON.stringify(updatedPresets)
      );
      setPresets(updatedPresets);
    } catch (error) {
      console.error("Failed to delete preset:", error);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const beatInterval = 60000 / bpm; // Beat/bar 간격 (밀리초)
      let beatCount = 0;

      // Beat/bar 비트마다 실행되는 함수
      const playBeat = () => {
        beatCount = (beatCount + 1) % beatPerBar;
        setCurrentBeat(beatCount);

        // Beat/bar 소리 재생 (sound-1)
        beatPlayer.seekTo(0);
        beatPlayer.play();

        // 햅틱 피드백
        if (Platform.OS === "ios") {
          Haptics.impactAsync(
            beatCount === 0
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light
          );
        }

        // Click/beat 소리 재생 (sound-3)
        // 각 Beat/bar 비트마다 Click/beat만큼 소리 재생
        if (clickIntervalRef.current) {
          clearInterval(clickIntervalRef.current);
        }

        if (clickPerBeat > 0) {
          let clickCount = 0;
          const clickInterval = beatInterval / clickPerBeat; // Click/beat 간격

          // Click/beat만큼 소리 재생 (첫 번째는 Beat/bar와 동시에, 나머지는 interval로)
          if (clickPerBeat > 1) {
            clickIntervalRef.current = setInterval(() => {
              clickCount++;
              if (clickCount < clickPerBeat) {
                clickPlayer.seekTo(0);
                clickPlayer.play();
              } else {
                if (clickIntervalRef.current) {
                  clearInterval(clickIntervalRef.current);
                  clickIntervalRef.current = null;
                }
              }
            }, clickInterval);
          }
        }
      };

      // 첫 번째 비트 즉시 재생
      setCurrentBeat(0);
      beatPlayer.seekTo(0);
      beatPlayer.play();
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // 첫 번째 비트의 Click/beat 재생
      if (clickPerBeat > 1) {
        let clickCount = 0;
        const clickInterval = beatInterval / clickPerBeat;
        clickIntervalRef.current = setInterval(() => {
          clickCount++;
          if (clickCount < clickPerBeat) {
            clickPlayer.seekTo(0);
            clickPlayer.play();
          } else {
            if (clickIntervalRef.current) {
              clearInterval(clickIntervalRef.current);
              clickIntervalRef.current = null;
            }
          }
        }, clickInterval);
      }

      // 두 번째 비트부터 interval로 재생
      intervalRef.current = setInterval(playBeat, beatInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (clickIntervalRef.current) {
        clearInterval(clickIntervalRef.current);
        clickIntervalRef.current = null;
      }
      setCurrentBeat(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (clickIntervalRef.current) {
        clearInterval(clickIntervalRef.current);
      }
    };
  }, [isPlaying, bpm, beatPerBar, clickPerBeat]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const adjustBpm = (delta: number) => {
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + delta)));
  };

  // 다음 템포로 순환
  const cycleTempo = () => {
    const currentIndex = TEMPO_MARKINGS.findIndex(
      (tempo) => tempo.name === selectedTempo.name
    );
    const nextIndex = (currentIndex + 1) % TEMPO_MARKINGS.length;
    const nextTempo = TEMPO_MARKINGS[nextIndex];
    setSelectedTempo(nextTempo);
    setBpm(nextTempo.bpm);
  };

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backgroundColor = Colors.dark.background;
  const textColor = Colors.dark.text;
  const tintColor = Colors.dark.tint;
  const borderColor = "#333";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
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

          {/* BPM 표시 및 조절 */}
          <View style={styles.bpmSection}>
            <ThemedText style={[styles.bpmLabel, { color: textColor }]}>
              BPM
            </ThemedText>
            <View style={styles.bpmControls}>
              <Pressable
                onPress={() => adjustBpm(-1)}
                style={[styles.bpmButton, { borderColor }]}
              >
                <MaterialIcons name="remove" size={24} color={textColor} />
              </Pressable>
              <Animated.View style={[styles.bpmDisplay, animatedStyle]}>
                <ThemedText
                  type="title"
                  style={[styles.bpmValue, { color: tintColor }]}
                >
                  {bpm}
                </ThemedText>
              </Animated.View>
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

          {/* 타임 시그니처 선택 */}
          <View style={styles.timeSignatureSection}>
            <View style={styles.selectBoxContainer}>
              {/* Beat/bar 셀렉트 박스 */}
              <View style={styles.selectBoxWrapper}>
                <ThemedText style={[styles.selectLabel, { color: textColor }]}>
                  Beat/bar
                </ThemedText>
                <Pressable
                  onPress={() => {
                    setShowBeatPerBarOptions(!showBeatPerBarOptions);
                    setShowClickPerBeatOptions(false);
                  }}
                  style={[
                    styles.selectBox,
                    {
                      backgroundColor,
                      borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.selectBoxText,
                      { color: textColor, textAlign: "center" },
                    ]}
                  >
                    {beatPerBar}
                  </ThemedText>
                </Pressable>
                <Modal
                  visible={showBeatPerBarOptions}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowBeatPerBarOptions(false)}
                >
                  <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowBeatPerBarOptions(false)}
                  >
                    <View
                      style={[
                        styles.modalContent,
                        { backgroundColor, borderColor },
                      ]}
                    >
                      <ScrollView style={styles.optionsScrollView}>
                        {Array.from({ length: 16 }, (_, i) => i + 1).map(
                          (value) => (
                            <Pressable
                              key={value}
                              onPress={() => {
                                setBeatPerBar(value);
                                setShowBeatPerBarOptions(false);
                              }}
                              style={[
                                styles.optionItem,
                                {
                                  backgroundColor:
                                    beatPerBar === value
                                      ? tintColor + "20"
                                      : "transparent",
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.optionItemText,
                                  {
                                    color:
                                      beatPerBar === value
                                        ? tintColor
                                        : textColor,
                                    fontWeight:
                                      beatPerBar === value ? "600" : "400",
                                  },
                                ]}
                              >
                                {value}
                              </ThemedText>
                            </Pressable>
                          )
                        )}
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>
              </View>

              {/* Click/beat 셀렉트 박스 */}
              <View style={styles.selectBoxWrapper}>
                <ThemedText style={[styles.selectLabel, { color: textColor }]}>
                  Click/beat
                </ThemedText>
                <Pressable
                  onPress={() => {
                    setShowClickPerBeatOptions(!showClickPerBeatOptions);
                    setShowBeatPerBarOptions(false);
                  }}
                  style={[
                    styles.selectBox,
                    {
                      backgroundColor,
                      borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.selectBoxText,
                      { color: textColor, textAlign: "center" },
                    ]}
                  >
                    {clickPerBeat}
                  </ThemedText>
                </Pressable>
                <Modal
                  visible={showClickPerBeatOptions}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowClickPerBeatOptions(false)}
                >
                  <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowClickPerBeatOptions(false)}
                  >
                    <View
                      style={[
                        styles.modalContent,
                        { backgroundColor, borderColor },
                      ]}
                    >
                      <ScrollView style={styles.optionsScrollView}>
                        {Array.from({ length: 16 }, (_, i) => i + 1).map(
                          (value) => (
                            <Pressable
                              key={value}
                              onPress={() => {
                                setClickPerBeat(value);
                                setShowClickPerBeatOptions(false);
                              }}
                              style={[
                                styles.optionItem,
                                {
                                  backgroundColor:
                                    clickPerBeat === value
                                      ? tintColor + "20"
                                      : "transparent",
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.optionItemText,
                                  {
                                    color:
                                      clickPerBeat === value
                                        ? tintColor
                                        : textColor,
                                    fontWeight:
                                      clickPerBeat === value ? "600" : "400",
                                  },
                                ]}
                              >
                                {value}
                              </ThemedText>
                            </Pressable>
                          )
                        )}
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>
              </View>

              {/* 템포 셀렉트 박스 */}
              <View style={styles.selectBoxWrapper}>
                <ThemedText style={[styles.selectLabel, { color: textColor }]}>
                  Tempo
                </ThemedText>
                <Pressable
                  onPress={cycleTempo}
                  style={[
                    styles.selectBox,
                    {
                      backgroundColor,
                      borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.selectBoxText, { color: textColor }]}
                  >
                    {selectedTempo.bpm}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 재생/정지 버튼 */}
          <Pressable
            onPress={togglePlayPause}
            style={[
              styles.playButton,
              {
                backgroundColor: isPlaying ? tintColor : backgroundColor,
                borderColor: tintColor,
              },
            ]}
          >
            <MaterialIcons
              name={isPlaying ? "pause" : "play-arrow"}
              size={48}
              color={isPlaying ? backgroundColor : tintColor}
            />
          </Pressable>
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
            style={[
              styles.modalContent,
              styles.saveModalContent,
              { backgroundColor, borderColor },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: borderColor, color: textColor, borderColor },
              ]}
              placeholder="Enter preset name"
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
                  Cancel
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
                  Save
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
                Saved Presets
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
                  No saved presets
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
                          BPM: {preset.bpm} | Beat/bar: {preset.beatPerBar} |
                          Click/beat: {preset.clickPerBeat} | {preset.tempoName}
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
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 32,
    minHeight: "100%",
  },
  bpmSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  bpmLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  bpmControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  bpmButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bpmDisplay: {
    minWidth: 100,
    alignItems: "center",
  },
  bpmValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 0,
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
  beatSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
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
  timeSignatureSection: {
    width: "100%",
    alignItems: "center",
  },
  selectBoxContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  selectBoxWrapper: {
    width: 100,
    alignItems: "center",
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  selectBox: {
    width: 100,
    height: 100,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  selectBoxText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    // minHeight: 40,
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
  saveModalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    overflow: "visible",
  },
  optionsScrollView: {
    maxHeight: 300,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  optionItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionItemLeft: {
    flex: 1,
  },
  optionItemTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionItemSubtitle: {
    fontSize: 12,
  },
  optionItemBpm: {
    fontSize: 18,
    marginLeft: 12,
  },
  optionItemText: {
    fontSize: 16,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  adContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.background,
    paddingTop: 8,
  },
  presetsModalContent: {
    width: "85%",
    maxWidth: 400,
    maxHeight: "70%",
    borderRadius: 16,
    borderWidth: 2,
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
  addPresetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addPresetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
