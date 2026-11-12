// Kids mode shell: counts screen time, enforces the daily limit and bedtime, and keeps
// children inside Kids mode (leaving needs the parent PIN).
import { Redirect, router, Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { AppState, BackHandler, StyleSheet, Text, View } from 'react-native';
import { KidsButton, kidsText } from '@/components/kids';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { fmtClock, inBedtime, secondsLeft } from '@/lib/kids/time';
import { useApp } from '@/lib/store';
import { useHydrated } from '@/lib/useHydrated';
import { colors, space } from '@/theme';

// Screens a grown-up uses: no timer, never blocked.
const GROWN_UP = ['/kids', '/kids/gate', '/kids/parent'];
const TICK = 10;

export default function KidsLayout() {
  const path = usePathname();
  const hydrated = useHydrated();
  const { kid } = useCurrentKid();
  const settings = useKids((s) => s.settings);
  const usage = useKids((s) => (s.currentId ? s.usage[s.currentId] : undefined));
  const extra = useKids((s) => s.extra);
  const addUsage = useKids((s) => s.addUsage);
  const kidScreen = !GROWN_UP.includes(path);
  const signedIn = useApp((s) => !!s.session);

  // Screen time counts only while a kids screen is open and the app is in front.
  useEffect(() => {
    if (!kidScreen || !kid) return;
    const t = setInterval(() => {
      if (AppState.currentState === 'active') addUsage(TICK);
    }, TICK * 1000);
    return () => clearInterval(t);
  }, [kidScreen, kid, addUsage]);

  // Android back button never leaves Kids mode from the kids home.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => path === '/kids/home');
    return () => sub.remove();
  }, [path]);

  if (!hydrated) return null;
  // Kids profiles belong to a parent, so Kids mode needs someone signed in (or a guest) on this phone.
  if (!signedIn) return <Redirect href="/" />;
  if (kidScreen && !kid) return <Redirect href="/kids" />;

  const bedtime = inBedtime(settings);
  const timeUp = secondsLeft(settings, usage, extra) <= 0;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.kidsCanvas }, animation: 'slide_from_right' }}>
        <Stack.Screen name="home" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="gate" options={{ presentation: 'modal' }} />
      </Stack>
      {kidScreen && kid && (bedtime || timeUp) ? <RestScreen bedtime={bedtime} name={kid.name} until={settings.bedtimeEnd} /> : null}
    </View>
  );
}

/** Shown over every kids screen when time is up or it's bedtime. A parent can unlock from the gate. */
function RestScreen({ bedtime, name, until }: { bedtime: boolean; name: string; until: string }) {
  return (
    <View style={{ ...StyleSheet.absoluteFill, backgroundColor: bedtime ? '#1B1745' : colors.kidsCanvas, padding: space.xxl, justifyContent: 'center', gap: space.lg }}
      accessibilityViewIsModal>
      <Text style={{ fontSize: 72, textAlign: 'center' }}>{bedtime ? '🌙' : '🦚'}</Text>
      <Text style={[kidsText.hero, { textAlign: 'center', color: bedtime ? colors.white : colors.indigo }]}>
        {bedtime ? `Sleep tight, ${name}!` : `Great learning today, ${name}!`}
      </Text>
      <Text style={[kidsText.body, { textAlign: 'center', color: bedtime ? '#D8D4FF' : colors.ink }]}>
        {bedtime ? `Moru is sleeping too. See you after ${fmtClock(until)}.` : 'Your screen time is finished for today. Moru will be waiting for you tomorrow!'}
      </Text>
      <KidsButton kind="cream" icon="lock-closed-outline" label="Grown-ups" onPress={() => router.push({ pathname: '/kids/gate', params: { next: '/kids/parent' } })} />
    </View>
  );
}
