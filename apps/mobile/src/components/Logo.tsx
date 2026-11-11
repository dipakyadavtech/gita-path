import Svg, { Circle, Path } from 'react-native-svg';
import { View } from 'react-native';
import { colors, radius } from '@/theme';

/** Chakra mark used for the Gita Path brand. */
export function Logo({ size = 64, bg = colors.indigo, stroke = colors.goldSoft }: { size?: number; bg?: string; stroke?: string }) {
  const s = size * 0.58;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Gita Path logo">
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.6}>
        <Circle cx={12} cy={12} r={8} />
        <Circle cx={12} cy={12} r={2} />
        <Path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.3 6.3l4.3 4.3M13.4 13.4l4.3 4.3M17.7 6.3l-4.3 4.3M10.6 13.4l-4.3 4.3" />
      </Svg>
    </View>
  );
}
export const LogoRadius = radius.lg;
