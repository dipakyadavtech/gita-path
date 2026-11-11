import { Ionicons } from '@expo/vector-icons';
import { Link, router, type Href } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, space, type } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 20, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} />;
}

/** Page wrapper: safe area, background, optional scroll. */
export function Screen({
  children,
  scroll = true,
  bg = colors.canvas,
  padded = true,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  bg?: string;
  padded?: boolean;
  footer?: ReactNode;
}) {
  const inner = padded ? { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg } : null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'left', 'right']}>
      <View style={styles.column}>
        {scroll ? (
          <ScrollView contentContainerStyle={inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, inner]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

export function T({ style, children, numberOfLines }: { style?: StyleProp<TextStyle>; children: ReactNode; numberOfLines?: number }) {
  return (
    <Text style={[type.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'teal' | 'onDark';
export function Button({
  label,
  onPress,
  href,
  kind = 'primary',
  icon,
  disabled,
  loading,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  href?: Href;
  kind?: ButtonKind;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const palette: Record<ButtonKind, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.saffron, fg: colors.white },
    secondary: { bg: colors.white, fg: colors.indigo, border: colors.indigo },
    ghost: { bg: colors.white, fg: colors.ink, border: colors.line },
    dark: { bg: colors.indigo, fg: colors.white },
    danger: { bg: colors.danger, fg: colors.white },
    teal: { bg: colors.teal, fg: colors.white },
    onDark: { bg: 'transparent', fg: colors.white, border: '#5B57A0' },
  };
  const p = palette[kind];
  const press = () => {
    if (disabled || loading) return;
    if (onPress) onPress();
    else if (href) router.push(href);
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={press}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: p.bg, borderColor: p.border ?? p.bg, opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={p.fg} /> : icon ? <Icon name={icon} size={18} color={p.fg} /> : null}
      <Text style={[styles.buttonText, { color: p.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function TextLink({ label, href, onPress, color = colors.saffron }: { label: string; href?: Href; onPress?: () => void; color?: string }) {
  const text = <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color, textDecorationLine: 'underline' }}>{label}</Text>;
  if (href) return <Link href={href} style={styles.textLink}>{text}</Link>;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={styles.textLink}>
      {text}
    </Pressable>
  );
}

export function Card({ children, style, tone = 'white', onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'white' | 'indigo' | 'teal' | 'saffron' | 'danger'; onPress?: () => void }) {
  const bg = { white: colors.white, indigo: colors.indigo, teal: colors.tealTint, saffron: colors.saffronTint, danger: colors.dangerTint }[tone];
  const border = tone === 'white' ? colors.line : bg;
  const body = <View style={[styles.card, { backgroundColor: bg, borderColor: border }, tone === 'white' && shadow.card, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      {body}
    </Pressable>
  );
}

export function Caps({ children, color = colors.muted }: { children: ReactNode; color?: string }) {
  return <Text style={[type.caps, { color }]}>{children}</Text>;
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[styles.chip, active ? { backgroundColor: colors.saffron, borderColor: colors.saffron } : null]}
    >
      {icon ? <Icon name={icon} size={14} color={active ? colors.white : colors.muted} /> : null}
      <Text style={[styles.chipText, active ? { color: colors.white } : null]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.saffron, track = '#ECECF2', height = 8 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: radius.full, backgroundColor: track, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, backgroundColor: color, borderRadius: radius.full }} />
    </View>
  );
}

export function IconButton({ icon, onPress, label, tone = 'light' }: { icon: IconName; onPress?: () => void; label: string; tone?: 'light' | 'dark' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.iconButton, tone === 'dark' && { backgroundColor: colors.indigo, borderColor: colors.indigo }]}
    >
      <Icon name={icon} size={20} color={tone === 'dark' ? colors.white : colors.ink} />
    </Pressable>
  );
}

export function TopBar({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={styles.topBar}>
      <IconButton icon="chevron-back" label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      <Text style={[type.h3, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
        {title ?? ''}
      </Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={type.label}>{label}</Text>
      <TextInput placeholderTextColor="#9A99AD" accessibilityLabel={label} style={styles.input} {...props} />
    </View>
  );
}

export function Stat({ value, label, color = colors.ink }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={{ fontFamily: fonts.heading, fontSize: 20, color }}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={type.h3}>{children}</Text>
      {action}
    </View>
  );
}

export function Row({ children, gap = space.sm, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Wrap({ children, gap = space.sm }: { children: ReactNode; gap?: number }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>{children}</View>;
}

export function VerseText({ lines, size = 19, color = colors.ink, center }: { lines: string[]; size?: number; color?: string; center?: boolean }) {
  return (
    <View accessible accessibilityLabel={lines.join(' ')}>
      {lines.map((l) => (
        <Text key={l} style={[type.verse, { fontSize: size, lineHeight: size * 1.65, color, textAlign: center ? 'center' : 'left' }]}>
          {l}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.xl, paddingTop: space.sm, gap: space.sm },
  button: { minHeight: 52, borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  buttonText: { fontFamily: fonts.heading, fontSize: 15 },
  textLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingHorizontal: space.sm },
  card: { borderRadius: radius.xl, borderWidth: 1, padding: space.lg },
  chip: { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  iconButton: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: space.lg, fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  stat: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingVertical: space.md, alignItems: 'center' },
});
