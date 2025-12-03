import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useState } from "react";
import { StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const { effectiveTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  // const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const backgroundColor = Colors.dark.background;
  const textColor = Colors.dark.text;
  const tintColor = Colors.dark.tint;
  const borderColor = "#333";

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* 사운드 설정 */}
        <ThemedView style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            Sound
          </ThemedText>
          <ThemedView style={styles.settingRow}>
            <ThemedView style={styles.settingInfo}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                Metronome Sound
              </ThemedText>
              <ThemedText
                style={[styles.settingDescription, { color: textColor }]}
              >
                Play sound on each beat
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

        {/* 앱 정보 */}
        <ThemedView style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: textColor }]}
          >
            App Info
          </ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: textColor }]}>
              Version
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: textColor }]}>
              v1.0.1
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
