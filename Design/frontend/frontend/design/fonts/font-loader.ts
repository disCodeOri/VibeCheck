import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

/**
 * Hook to load all required Vibe Check fonts in Expo / React Native.
 * Usage:
 *   const [fontsLoaded] = useVibeCheckFonts();
 *   if (!fontsLoaded) return <SplashScreen />;
 */
export function useVibeCheckFonts() {
  return useFonts({
    Anton_400Regular,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
}
