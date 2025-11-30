import {
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import mobileAds from "react-native-google-mobile-ads";
import "react-native-reanimated";

import { DrawerMenuButton } from "@/components/drawer-menu-button";
import { DrawerProvider } from "@/components/drawer-provider";
import { Colors } from "@/constants/theme";
import { ThemeProvider } from "@/contexts/theme-context";

function AppContent() {
  return (
    <NavigationThemeProvider value={DarkTheme}>
      <DrawerProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.dark.background,
            },
            headerTintColor: Colors.dark.text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => <DrawerMenuButton />,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Metronome & Chords",
            }}
          />
          <Stack.Screen
            name="metronome"
            options={{
              title: "Metronome",
            }}
          />
          <Stack.Screen
            name="chords"
            options={{
              title: "Random Chords",
            }}
          />
          <Stack.Screen
            name="chords-play"
            options={{
              title: "Play Random Chords",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </DrawerProvider>
      <StatusBar style="light" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Google Mobile Ads 초기화
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("Mobile Ads initialized", adapterStatuses);
      })
      .catch((error) => {
        console.error("Mobile Ads initialization error:", error);
      });
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
