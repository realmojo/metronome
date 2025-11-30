import { Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export function HeaderMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  const menuItems = [
    { label: "메트로놈", path: "/metronome" },
    { label: "음악적 코드", path: "/chords" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <ThemedView style={styles.container}>
      {menuItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Pressable
            key={item.path}
            onPress={() => router.push(item.path as any)}
            style={[
              styles.menuItem,
              active && {
                borderBottomWidth: 2,
                borderBottomColor:
                  colorScheme === "dark"
                    ? Colors.dark.tint
                    : Colors.light.tint,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.menuText,
                active && {
                  color:
                    colorScheme === "dark"
                      ? Colors.dark.tint
                      : Colors.light.tint,
                  fontWeight: "600",
                },
              ]}
            >
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    width: "100%",
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 80,
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
  },
});

