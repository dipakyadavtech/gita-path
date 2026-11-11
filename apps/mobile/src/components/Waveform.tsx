import { View } from 'react-native';
import { colors } from '@/theme';

const BARS = [8, 14, 20, 12, 24, 18, 10, 22, 16, 26, 12, 18, 9, 20, 14, 24, 10, 16, 22, 12, 8, 18, 14, 20];
export function Waveform({ progress, active = colors.goldSoft, idle = colors.indigoSoft }: { progress: number; active?: string; idle?: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, height: 28 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {BARS.map((h, i) => (
        <View key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: i / BARS.length < progress ? active : idle }} />
      ))}
    </View>
  );
}
