import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

const MIN_BPM = 30;
const MAX_BPM = 240;
const DEFAULT_BPM = 120;

const TIME_SIGNATURES = [
  { label: "4/4", beats: 4 },
  { label: "3/4", beats: 3 },
  { label: "2/4", beats: 2 },
  { label: "6/8", beats: 6 },
];

export default function MetronomeScreen() {
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[0]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const { effectiveTheme } = useTheme();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const beatAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 사운드 로드
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/sound-1.mp3")
        );
        soundRef.current = sound;
      } catch (error) {
        console.error("Failed to load sound", error);
      }
    };
    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / bpm; // 밀리초 단위
      let beatCount = 0;

      intervalRef.current = setInterval(() => {
        beatCount = (beatCount + 1) % timeSignature.beats;
        setCurrentBeat(beatCount);

        // 비트 애니메이션
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnimation, {
              toValue: 1.3,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(beatAnimation, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnimation, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(beatAnimation, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // 소리 재생
        if (soundRef.current) {
          soundRef.current.replayAsync();
        }

        // 햅틱 피드백
        if (Platform.OS === "ios") {
          Haptics.impactAsync(
            beatCount === 0
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light
          );
        }
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentBeat(0);
      scaleAnimation.setValue(1);
      beatAnimation.setValue(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, timeSignature]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const adjustBpm = (delta: number) => {
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + delta)));
  };

  const backgroundColor =
    effectiveTheme === "dark"
      ? Colors.dark.background
      : Colors.light.background;
  const textColor =
    effectiveTheme === "dark" ? Colors.dark.text : Colors.light.text;
  const tintColor =
    effectiveTheme === "dark" ? Colors.dark.tint : Colors.light.tint;
  const borderColor = effectiveTheme === "dark" ? "#333" : "#e0e0e0";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
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
              <View style={styles.bpmDisplay}>
                <ThemedText
                  type="title"
                  style={[styles.bpmValue, { color: tintColor }]}
                >
                  {bpm}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => adjustBpm(1)}
                style={[styles.bpmButton, { borderColor }]}
              >
                <MaterialIcons name="add" size={24} color={textColor} />
              </Pressable>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${
                        ((bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100
                      }%`,
                      backgroundColor: tintColor,
                    },
                  ]}
                />
                <Pressable
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${((bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100}%`,
                      backgroundColor: tintColor,
                    },
                  ]}
                  onPress={() => {}}
                />
              </View>
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

          {/* 비트 표시 */}
          <View style={styles.beatSection}>
            <Animated.View
              style={[
                styles.beatIndicator,
                {
                  backgroundColor: tintColor,
                  transform: [{ scale: scaleAnimation }],
                  opacity: beatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
            <View style={styles.beatDots}>
              {Array.from({ length: timeSignature.beats }).map((_, index) => (
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

          {/* 타임 시그니처 선택 */}
          <View style={styles.timeSignatureSection}>
            <ThemedText style={[styles.sectionLabel, { color: textColor }]}>
              타임 시그니처
            </ThemedText>
            <View style={styles.timeSignatureButtons}>
              {TIME_SIGNATURES.map((sig) => (
                <Pressable
                  key={sig.label}
                  onPress={() => setTimeSignature(sig)}
                  style={[
                    styles.timeSignatureButton,
                    {
                      backgroundColor:
                        timeSignature.label === sig.label
                          ? tintColor
                          : backgroundColor,
                      borderColor,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.timeSignatureText,
                      {
                        color:
                          timeSignature.label === sig.label
                            ? backgroundColor
                            : textColor,
                      },
                    ]}
                  >
                    {sig.label}
                  </ThemedText>
                </Pressable>
              ))}
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
    fontSize: 64,
    fontWeight: "bold",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 8,
  },
  sliderTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    top: -8,
    marginLeft: -10,
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
    alignItems: "center",
    gap: 24,
  },
  beatIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  beatDots: {
    flexDirection: "row",
    gap: 12,
  },
  beatDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timeSignatureSection: {
    width: "100%",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  timeSignatureButtons: {
    flexDirection: "row",
    gap: 12,
  },
  timeSignatureButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 60,
    alignItems: "center",
  },
  timeSignatureText: {
    fontSize: 18,
    fontWeight: "600",
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
});
