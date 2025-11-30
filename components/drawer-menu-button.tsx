import { Pressable, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/theme";
import { useDrawer } from "@/components/use-drawer";

export function DrawerMenuButton() {
  const { openDrawer } = useDrawer();

  return (
    <Pressable
      onPress={openDrawer}
      style={styles.button}
      android_ripple={{ color: Colors.light.icon }}
    >
      <MaterialIcons name="menu" size={24} color={Colors.dark.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
    padding: 8,
  },
});

