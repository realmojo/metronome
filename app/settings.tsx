import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  // const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const backgroundColor =
    effectiveTheme === "dark"
      ? Colors.dark.background
      : Colors.light.background;
  const textColor =
    effectiveTheme === "dark" ? Colors.dark.text : Colors.light.text;
  const tintColor =
    effectiveTheme === "dark" ? Colors.dark.tint : Colors.light.tint;
  const borderColor = effectiveTheme === "dark" ? "#333" : "#e0e0e0";

  const themeOptions: { label: string; value: "light" | "dark" }[] = [
    { label: "라이트", value: "light" },
    { label: "다크", value: "dark" },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* 테마 설정 */}
        <ThemedView style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            테마
          </ThemedText>
          <ThemedView style={styles.optionsContainer}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setThemeMode(option.value)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      themeMode === option.value
                        ? tintColor + "20"
                        : backgroundColor,
                    borderColor:
                      themeMode === option.value ? tintColor : borderColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    {
                      color: themeMode === option.value ? tintColor : textColor,
                      fontWeight: themeMode === option.value ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </ThemedText>
                {themeMode === option.value && (
                  <MaterialIcons name="check" size={20} color={tintColor} />
                )}
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* 사운드 설정 */}
        <ThemedView style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            사운드
          </ThemedText>
          <ThemedView style={styles.settingRow}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                메트로놈 소리
              </ThemedText>
              <ThemedText
                style={[styles.settingDescription, { color: textColor }]}
              >
                비트마다 소리 재생
              </ThemedText>
            </ThemedView>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: borderColor, true: tintColor + "80" }}
              thumbColor={soundEnabled ? tintColor : "#f4f3f4"}
            />
          </ThemedView>
        </ThemedView>

        {/* 햅틱 설정 */}
        {/* <ThemedView style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            햅틱
          </ThemedText>
          <ThemedView style={styles.settingRow}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                햅틱 피드백
              </ThemedText>
              <ThemedText
                style={[styles.settingDescription, { color: textColor }]}
              >
                비트마다 진동 피드백
              </ThemedText>
            </ThemedView>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: borderColor, true: tintColor + "80" }}
              thumbColor={hapticsEnabled ? tintColor : "#f4f3f4"}
            />
          </ThemedView>
        </ThemedView> */}

        {/* 앱 정보 */}
        <ThemedView style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            앱 정보
          </ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: textColor }]}>
              버전
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: textColor }]}>
              1.0.0
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    opacity: 0.7,
  },
});
