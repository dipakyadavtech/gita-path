import { Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { NotoSerifDevanagari_500Medium, NotoSerifDevanagari_600SemiBold } from '@expo-google-fonts/noto-serif-devanagari';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useHydrated } from '@/lib/useHydrated';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold, Sora_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    NotoSerifDevanagari_500Medium, NotoSerifDevanagari_600SemiBold,
    Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold,
  });
  const hydrated = useHydrated();

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.indigo }}>
        <ActivityIndicator color={colors.goldSoft} />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas }, animation: 'slide_from_right' }}>
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="streak" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
