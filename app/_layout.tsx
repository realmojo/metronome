import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { DrawerMenuButton } from "@/components/drawer-menu-button";
import { DrawerProvider } from "@/components/drawer-provider";
import { Colors } from "@/constants/theme";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

function AppContent() {
  const { effectiveTheme } = useTheme();

  return (
    <NavigationThemeProvider
      value={effectiveTheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <DrawerProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor:
                effectiveTheme === "dark"
                  ? Colors.dark.background
                  : Colors.light.background,
            },
            headerTintColor:
              effectiveTheme === "dark" ? Colors.dark.text : Colors.light.text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => <DrawerMenuButton />,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "홈",
            }}
          />
          <Stack.Screen
            name="metronome"
            options={{
              title: "메트로놈",
            }}
          />
          <Stack.Screen
            name="chords"
            options={{
              title: "음악적 코드",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "설정",
            }}
          />
          <Stack.Screen
            name="explore"
            options={{
              title: "Explore",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </DrawerProvider>
      <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
