import { usePathname, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDrawer } from "@/components/use-drawer";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

export function DrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { effectiveTheme } = useTheme();
  const { closeDrawer } = useDrawer();

  const menuItems = [
    { label: "메트로놈", path: "/metronome" },
    { label: "코드", path: "/chords" },
    { label: "설정", path: "/settings" },
  ];

  const isActive = (path: string) => pathname === path;

  const handlePress = (path: string) => {
    router.push(path as any);
    closeDrawer();
  };

  const borderColor = effectiveTheme === "dark" ? "#333" : "#e0e0e0";

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type="title" style={styles.headerTitle}>
            Metronome
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.menuContainer}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Pressable
                key={item.path}
                onPress={() => handlePress(item.path)}
                style={[
                  styles.menuItem,
                  active && {
                    backgroundColor:
                      effectiveTheme === "dark"
                        ? Colors.dark.tint + "20"
                        : Colors.light.tint + "20",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.menuText,
                    active && {
                      color:
                        effectiveTheme === "dark"
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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
  },
});
