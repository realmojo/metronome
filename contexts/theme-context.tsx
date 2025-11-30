import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "auto";

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@metronome:theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 테마 불러오기
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "auto")) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // 테마 변경 및 저장
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };

  // 실제 적용될 테마 계산
  const effectiveTheme =
    themeMode === "auto"
      ? systemColorScheme ?? "light"
      : themeMode;

  // 로딩 중에도 기본값으로 Context 제공
  const contextValue = {
    themeMode,
    setThemeMode,
    effectiveTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

