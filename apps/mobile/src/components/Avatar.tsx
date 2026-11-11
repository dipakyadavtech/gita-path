import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/theme';

export function Avatar({ name, size = 40, color = colors.saffron, href }: { name: string; size?: number; color?: string; href?: '/profile' }) {
  const body = (
    <Text style={{ fontFamily: fonts.heading, fontSize: size * 0.42, color: colors.white }}>{name.slice(0, 1).toUpperCase()}</Text>
  );
  return (
    <Pressable
      disabled={!href}
      onPress={() => href && router.push(href)}
      accessibilityRole={href ? 'button' : 'image'}
      accessibilityLabel={href ? 'Profile' : name}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}
    >
      {body}
    </Pressable>
  );
}
