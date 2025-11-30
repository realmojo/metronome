import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

export default function HomeScreen() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();

  const menuItems = [
    {
      label: "메트로놈",
      path: "/metronome",
      icon: "music-note" as const,
    },
    {
      label: "코드",
      path: "/chords",
      icon: "library-music" as const,
    },
  ];

  const backgroundColor =
    effectiveTheme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor =
    effectiveTheme === "dark" ? Colors.dark.text : Colors.light.text;
  const tintColor =
    effectiveTheme === "dark" ? Colors.dark.tint : Colors.light.tint;
  const borderColor = effectiveTheme === "dark" ? "#333" : "#e0e0e0";

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* 로고 */}
        <Image
          source={require("@/assets/images/metronome-logo.png")}
          style={styles.logo}
          contentFit="contain"
        />

        {/* 메뉴 버튼들 */}
        <ThemedView style={styles.menuContainer}>
          {menuItems.map((item) => (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={[
                styles.menuButton,
                {
                  backgroundColor: backgroundColor,
                  borderColor: tintColor,
                },
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={32}
                color={tintColor}
                style={styles.icon}
              />
              <ThemedText
                type="subtitle"
                style={[styles.menuText, { color: tintColor }]}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
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
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  menuContainer: {
    width: "100%",
    gap: 20,
    maxWidth: 300,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  icon: {
    marginRight: 4,
  },
  menuText: {
    fontSize: 20,
    fontWeight: "600",
  },
});
