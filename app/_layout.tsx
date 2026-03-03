import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { setAudioModeAsync } from "expo-audio";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { CustomSplashScreen } from "@/components/custom-splash-screen";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  const [fontsLoaded] = useFonts({
    NotoNaskhArabic: require("@/assets/tarteel/font/NotoNaskhArabic-VariableFont_wght.ttf"),
    SacredRamadhan: require("@/assets/tarteel/font/sacred-ramadhan.otf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Prepare resources
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode:
            Platform.OS === "ios" ? "mixWithOthers" : "doNotMix",
          shouldRouteThroughEarpiece: false,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        if (fontsLoaded) {
          setAppIsReady(true);
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!appIsReady || !splashAnimationFinished) {
    return (
      <CustomSplashScreen
        onAnimationComplete={() => setSplashAnimationFinished(true)}
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="hadith-detail" options={{ headerShown: false }} />
        <Stack.Screen name="asmaul-husna" options={{ headerShown: false }} />
        <Stack.Screen name="doa-harian" options={{ headerShown: false }} />
        <Stack.Screen name="doa-detail" options={{ headerShown: false }} />
        <Stack.Screen name="dzikir" options={{ headerShown: false }} />
        <Stack.Screen name="dzikir-detail" options={{ headerShown: false }} />
        <Stack.Screen name="pengaturan" options={{ headerShown: false }} />
        <Stack.Screen name="arah-kiblat" options={{ headerShown: false }} />
        <Stack.Screen name="lainnya" options={{ headerShown: false }} />
        <Stack.Screen name="surah-detail" options={{ headerShown: false }} />
        <Stack.Screen name="donasi" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal", headerShown: true }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
