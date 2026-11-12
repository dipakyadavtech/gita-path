// Kids mode UI kit: bright, chunky, big tap targets (≥ 56 pt), Baloo 2 type.
import { router, usePathname, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { AVATAR_EMOJI } from '@/lib/kids/content';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { fmtLeft, secondsLeft } from '@/lib/kids/time';
import { colors, fonts, radius, shadow, space } from '@/theme';
import { Icon, Screen, type IconName } from './ui';

export const kidsText = StyleSheet.create({
  hero: { fontFamily: fonts.kidsHeavy, fontSize: 32, lineHeight: 38, color: colors.indigo },
  title: { fontFamily: fonts.kidsHeavy, fontSize: 24, lineHeight: 30, color: colors.indigo },
  h2: { fontFamily: fonts.kids, fontSize: 20, lineHeight: 26, color: colors.indigo },
  body: { fontFamily: fonts.kidsMedium, fontSize: 17, lineHeight: 24, color: colors.ink },
  small: { fontFamily: fonts.kidsMedium, fontSize: 14, lineHeight: 19, color: colors.muted },
  caps: { fontFamily: fonts.kids, fontSize: 13, letterSpacing: 0.6, color: colors.teal, textTransform: 'uppercase' },
});

export function K({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return <Text style={[kidsText.body, style]} numberOfLines={numberOfLines}>{children}</Text>;
}

/** Page wrapper with the kids header and (optionally) the bottom tabs. */
export function KidsScreen({ title, subtitle, children, tabs = true, onBack, scroll = true }: {
  title: string; subtitle?: string; children: ReactNode; tabs?: boolean; onBack?: () => void; scroll?: boolean;
}) {
  return (
    <Screen bg={colors.kidsCanvas} scroll={scroll} footer={tabs ? <KidsTabBar /> : undefined}>
      <KidsHeader title={title} subtitle={subtitle} onBack={onBack} />
      {children}
    </Screen>
  );
}

function TimePill() {
  const settings = useKids((s) => s.settings);
  const usage = useKids((s) => (s.currentId ? s.usage[s.currentId] : undefined));
  const extra = useKids((s) => s.extra);
  const left = secondsLeft(settings, usage, extra);
  return (
    <View style={[styles.pill, { backgroundColor: left < 120 ? colors.saffronTint : '#CFF1F2' }]} accessibilityLabel={`${Math.ceil(left / 60)} minutes of screen time left`}>
      <Icon name="timer-outline" size={18} color={colors.indigo} />
      <Text style={styles.pillText}>{fmtLeft(left)}</Text>
    </View>
  );
}

export function KidsHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const { kid } = useCurrentKid();
  return (
    <View style={styles.header}>
      {onBack ? (
        <RoundButton icon="arrow-back" label="Back" onPress={onBack} />
      ) : (
        <View style={styles.logo} accessibilityElementsHidden><Text style={{ fontSize: 22 }}>🦚</Text></View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={kidsText.h2} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={[kidsText.small, { color: colors.teal }]}>{subtitle}</Text> : null}
      </View>
      <TimePill />
      <RoundButton icon="lock-closed-outline" label="Grown-ups: parent zone" onPress={() => router.push({ pathname: '/kids/gate', params: { next: '/kids/parent' } })} />
      {kid ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Switch child, now ${kid.name}`} onPress={() => router.push({ pathname: '/kids/gate', params: { next: '/kids' } })} style={styles.avatar}>
          <Text style={{ fontSize: 20 }}>{AVATAR_EMOJI[kid.avatar]}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function RoundButton({ icon, label, onPress, tone = 'cream' }: { icon: IconName; label: string; onPress: () => void; tone?: 'cream' | 'indigo' }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
      style={({ pressed }) => [styles.round, tone === 'indigo' && { backgroundColor: colors.indigo }, pressed && { transform: [{ translateY: 2 }] }]}>
      <Icon name={icon} size={22} color={tone === 'indigo' ? colors.white : colors.indigo} />
    </Pressable>
  );
}

const TABS: { href: Href; match: string; label: string; icon: IconName; iconOn: IconName }[] = [
  { href: '/kids/home', match: '/kids/home', label: 'Home', icon: 'home-outline', iconOn: 'home' },
  { href: '/kids/watch', match: '/kids/watch', label: 'Watch', icon: 'play-circle-outline', iconOn: 'play-circle' },
  { href: '/kids/sing', match: '/kids/sing', label: 'Sing', icon: 'musical-notes-outline', iconOn: 'musical-notes' },
  { href: '/kids/play', match: '/kids/play', label: 'Play', icon: 'game-controller-outline', iconOn: 'game-controller' },
];

export function KidsTabBar() {
  const path = usePathname();
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {TABS.map((t) => {
        const on = path.startsWith(t.match);
        return (
          <Pressable key={t.label} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label}
            onPress={() => {
              if (on) return;
              // Keep the stack as [home, tab] so back always lands on the kids home.
              if (t.match === '/kids/home') router.dismissTo('/kids/home');
              else if (path === '/kids/home') router.push(t.href);
              else router.replace(t.href);
            }} style={[styles.tab, on && styles.tabOn]}>
            <Icon name={on ? t.iconOn : t.icon} size={24} color={on ? colors.white : colors.indigo} />
            <Text style={[styles.tabText, on && { color: colors.white }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function KidsCard({ children, style, tone = 'white', onPress, label }: {
  children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'white' | 'cream' | 'sky' | 'mint' | 'sun'; onPress?: () => void; label?: string;
}) {
  const bg = { white: colors.white, cream: '#F3EAD6', sky: '#CFF1F2', mint: colors.leafTint, sun: '#FFF0C7' }[tone];
  const body = <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
  if (!onPress) return body;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>{body}</Pressable>;
}

const BTN = {
  indigo: { bg: colors.indigo, edge: '#120F3A', text: colors.white },
  teal: { bg: colors.teal, edge: '#083C3F', text: colors.white },
  brown: { bg: '#6B3E07', edge: '#3E2304', text: colors.white },
  cream: { bg: '#F3EAD6', edge: '#DCCDAE', text: colors.indigo },
  saffron: { bg: colors.saffron, edge: colors.saffronDark, text: colors.white },
} as const;

export function KidsButton({ label, onPress, icon, kind = 'indigo', disabled, small }: {
  label: string; onPress: () => void; icon?: IconName; kind?: keyof typeof BTN; disabled?: boolean; small?: boolean;
}) {
  const c = BTN[kind];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.btn, small && { minHeight: 48, paddingVertical: 8 }, { backgroundColor: c.bg, borderBottomColor: c.edge, opacity: disabled ? 0.5 : 1 },
        pressed && { borderBottomWidth: 2, transform: [{ translateY: 3 }] }]}>
      {icon ? <Icon name={icon} size={small ? 20 : 24} color={c.text} /> : null}
      <Text style={[styles.btnText, small && { fontSize: 16 }, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

export function StarPill({ stars, label }: { stars: number; label?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: '#FFF0C7' }]} accessibilityLabel={`${stars} stars`}>
      <Text style={{ fontSize: 16 }}>⭐</Text>
      <Text style={styles.pillText}>{label ?? stars}</Text>
    </View>
  );
}

/** Moru (or a friend) saying something in a speech bubble. */
export function Buddy({ emoji = '🦚', name = 'Moru', children, tint = '#DDEFFF' }: { emoji?: string; name?: string; children: ReactNode; tint?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
      <View style={[styles.buddy, { backgroundColor: tint }]} accessibilityLabel={name}><Text style={{ fontSize: 30 }}>{emoji}</Text></View>
      <View style={styles.bubble}>
        <Text style={[kidsText.small, { color: colors.teal, fontFamily: fonts.kids }]}>{name} says</Text>
        <Text style={kidsText.body}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logo: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3EAD6', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: '#DCCDAE' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 8 },
  pillText: { fontFamily: fonts.kids, fontSize: 15, color: colors.indigo },
  tabs: { flexDirection: 'row', backgroundColor: '#F6EEDC', borderRadius: 28, padding: 6, gap: 4, marginHorizontal: space.lg, marginBottom: space.sm },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 22, minHeight: 60 },
  tabOn: { backgroundColor: colors.indigo },
  tabText: { fontFamily: fonts.kids, fontSize: 14, color: colors.indigo },
  card: { borderRadius: 28, padding: space.lg, gap: space.md, ...shadow.card },
  btn: { minHeight: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl, paddingVertical: 12, borderBottomWidth: 5 },
  btnText: { fontFamily: fonts.kidsHeavy, fontSize: 19 },
  buddy: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  bubble: { flex: 1, backgroundColor: colors.white, borderRadius: 20, borderTopLeftRadius: 4, padding: space.md, ...shadow.card },
});
