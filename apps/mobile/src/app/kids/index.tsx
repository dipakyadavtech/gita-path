// K1 · Who’s learning today? (profile picker). First visit explains Kids mode to the parent.
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Buddy, K, KidsButton, KidsCard, kidsText } from '@/components/kids';
import { Screen, TopBar } from '@/components/ui';
import { AVATAR_EMOJI } from '@/lib/kids/content';
import { useKids } from '@/lib/kids/store';
import { pullKids } from '@/lib/kids/sync';
import { colors, fonts, space } from '@/theme';

export default function WhoIsLearning() {
  const profiles = useKids((s) => s.profiles);
  const pinHash = useKids((s) => s.pinHash);
  const active = useKids((s) => s.active);
  const select = useKids((s) => s.select);
  const setActive = useKids((s) => s.setActive);

  const start = (id: string) => {
    select(id);
    setActive(true);
    router.replace('/kids/home');
  };
  // A parent who signed in again on this phone gets their children's profiles back.
  useEffect(() => {
    if (profiles.length === 0) pullKids().catch(() => {});
  }, [profiles.length]);

  const exitToApp = () => (active ? router.push({ pathname: '/kids/gate', params: { next: '/kids/parent' } }) : router.replace('/(tabs)'));

  if (!pinHash || profiles.length === 0) {
    return (
      <Screen bg={colors.kidsCanvas}>
        <TopBar title="Kids mode" onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />
        <Text style={kidsText.hero}>A gentle Gita garden for children</Text>
        <Buddy>Namaste! I’m Moru. I tell short Krishna stories, sing easy shlokas and play word games.</Buddy>
        <KidsCard>
          <Text style={kidsText.h2}>For grown-ups</Text>
          {[
            ['🔒', 'You set a 4-digit parent PIN. Leaving Kids mode or changing settings needs it.'],
            ['⏳', 'Daily screen time (15 minutes to start) and a bedtime lock.'],
            ['🚫', 'No ads, no chat, no links out of the app, no autoplay.'],
            ['👨‍👩‍👧', 'Up to 4 children. Children never sign in; your account owns their profiles.'],
          ].map(([e, t]) => (
            <View key={t} style={{ flexDirection: 'row', gap: space.md }}>
              <Text style={{ fontSize: 22 }}>{e}</Text>
              <K style={{ flex: 1, fontSize: 16 }}>{t}</K>
            </View>
          ))}
        </KidsCard>
        <KidsButton
          label={pinHash ? 'Add your child' : 'Set a parent PIN'}
          icon="lock-closed"
          onPress={() => router.push({ pathname: '/kids/gate', params: { mode: pinHash ? 'verify' : 'create', next: profiles.length ? '/kids' : '/kids/parent?add=1' } })}
        />
      </Screen>
    );
  }

  return (
    <Screen bg={colors.kidsCanvas}>
      <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.lg }}>
        <Text style={{ fontSize: 56 }} accessibilityElementsHidden>🦚</Text>
        <Text style={[kidsText.hero, { textAlign: 'center' }]}>Who’s learning today?</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, justifyContent: 'center' }}>
        {profiles.map((p) => (
          <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${p.name}, age ${p.age}`} onPress={() => start(p.id)}
            style={({ pressed }) => [{ alignItems: 'center', gap: space.sm, width: 140, paddingVertical: space.lg, backgroundColor: colors.white, borderRadius: 28, borderBottomWidth: 5, borderBottomColor: colors.kidsLine }, pressed && { transform: [{ translateY: 3 }] }]}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#DDEFFF', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 48 }}>{AVATAR_EMOJI[p.avatar]}</Text>
            </View>
            <Text style={kidsText.h2}>{p.name}</Text>
            <Text style={kidsText.small}>Age {p.age}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ gap: space.md, marginTop: space.lg }}>
        <KidsButton kind="cream" icon="settings-outline" label="Parent zone" onPress={() => router.push({ pathname: '/kids/gate', params: { next: '/kids/parent' } })} />
        <Pressable accessibilityRole="button" onPress={exitToApp} style={{ alignSelf: 'center', padding: space.md }}>
          <Text style={{ fontFamily: fonts.kids, fontSize: 16, color: colors.teal, textDecorationLine: 'underline' }}>{active ? 'Grown-ups: leave Kids mode' : 'Back to my Gita Path'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
