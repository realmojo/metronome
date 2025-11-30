import { Pressable, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";
import { useDrawer } from "@/components/use-drawer";

export function DrawerMenuButton() {
  const { openDrawer } = useDrawer();
  const { effectiveTheme } = useTheme();

  return (
    <Pressable
      onPress={openDrawer}
      style={styles.button}
      android_ripple={{ color: Colors.light.icon }}
    >
      <MaterialIcons
        name="menu"
        size={24}
        color={
          effectiveTheme === "dark" ? Colors.dark.text : Colors.light.text
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
    padding: 8,
  },
});

