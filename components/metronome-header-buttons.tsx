import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";

type MetronomeHeaderButtonsProps = {
  onSavePress: () => void;
  onPresetsPress: () => void;
};

export function MetronomeHeaderButtons({
  onSavePress,
  onPresetsPress,
}: MetronomeHeaderButtonsProps) {
  const tintColor = Colors.dark.tint;
  const backgroundColor = Colors.dark.background;

  return (
    <View style={styles.container}>
      <Pressable onPress={onPresetsPress} style={[styles.button]}>
        <MaterialIcons name="bookmark" size={20} color={tintColor} />
      </Pressable>
      <Pressable onPress={onSavePress} style={[styles.button]}>
        <MaterialIcons name="save" size={18} color={tintColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.dark.tint,
  },
});
