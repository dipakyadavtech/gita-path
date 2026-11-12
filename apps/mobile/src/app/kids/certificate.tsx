// K9 · Milestone certificate: unlocked after 2 stories and 2 shlokas. Shown to the family.
import { router } from 'expo-router';
import { Share, Text, View } from 'react-native';
import { K, KidsButton, KidsCard, KidsScreen, kidsText } from '@/components/kids';
import { ProgressBar } from '@/components/ui';
import { kidsShlokas, kidsStories } from '@/lib/kids/content';
import { useCurrentKid } from '@/lib/kids/store';
import { colors, fonts, space } from '@/theme';

const NEED = { stories: 2, shlokas: 2 };

export default function Certificate() {
  const { kid, progress } = useCurrentKid();
  if (!kid) return null;
  const s = Object.keys(progress.stories).length;
  const k = Object.keys(progress.shlokas).length;
  const earned = s >= NEED.stories && k >= NEED.shlokas;
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  if (!earned) {
    return (
      <KidsScreen title="Certificate" onBack={() => router.back()} tabs={false}>
        <KidsCard style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 60 }}>🎖️</Text>
          <Text style={[kidsText.title, { textAlign: 'center' }]}>Your Little Seeker certificate is on its way!</Text>
          <K style={{ textAlign: 'center' }}>Watch {NEED.stories} stories and sing {NEED.shlokas} shlokas to earn it.</K>
          <View style={{ alignSelf: 'stretch', gap: space.sm }}>
            <K>Stories: {Math.min(s, NEED.stories)} / {NEED.stories}</K>
            <ProgressBar value={Math.min(1, s / NEED.stories)} color={colors.saffron} height={12} />
            <K>Shlokas: {Math.min(k, NEED.shlokas)} / {NEED.shlokas}</K>
            <ProgressBar value={Math.min(1, k / NEED.shlokas)} color={colors.teal} height={12} />
          </View>
        </KidsCard>
        <KidsButton kind="cream" icon="home" label="Back to the garden" onPress={() => router.dismissTo('/kids/home')} />
      </KidsScreen>
    );
  }

  const share = () =>
    Share.share({ message: `🎖️ ${kid.name} earned the Gita Path Kids “Little Seeker” certificate: ${s} Krishna stories watched and ${k} shlokas sung, with ${progress.stickers.length} stickers collected!` }).catch(() => {});

  return (
    <KidsScreen title="Certificate" subtitle="Milestone cleared!" onBack={() => router.back()} tabs={false}>
      <KidsCard tone="sky" style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 64 }}>🦚🎉</Text>
        <Text style={[kidsText.hero, { textAlign: 'center' }]}>Shabash, {kid.name}!</Text>
        <K>You are an official Little Seeker 🪷</K>
      </KidsCard>

      <View style={{ borderRadius: 30, borderWidth: 6, borderColor: '#E3B45A', backgroundColor: '#FFFBF1', padding: space.xl, gap: space.md, alignItems: 'center' }}
        accessibilityLabel={`Certificate for ${kid.name}`}>
        <Text style={[kidsText.caps, { textAlign: 'center' }]}>Bhagavad Gita Path · Bal Sangha</Text>
        <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: 24, color: '#7C3A06', textAlign: 'center' }}>Little Seeker Badge of Honour</Text>
        <K style={{ fontStyle: 'italic', color: colors.muted }}>Joyfully presented to</K>
        <View style={{ backgroundColor: '#E4E1FA', borderRadius: 24, paddingHorizontal: space.xl, paddingVertical: space.sm }}>
          <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: 28, color: colors.indigo }}>{kid.name} <Text style={{ fontSize: 16 }}>(age {kid.age})</Text></Text>
        </View>
        <K style={{ textAlign: 'center' }}>For listening to Krishna’s stories, singing sacred shlokas, and learning that truth, courage and friendship make a heart shine.</K>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[[`${s}/${kidsStories.length}`, 'Stories'], [`${k}/${kidsShlokas.length}`, 'Shlokas'], [String(progress.stickers.length), 'Stickers']].map(([n, l]) => (
            <View key={l} style={{ flex: 1, backgroundColor: '#F3EAD6', borderRadius: 18, padding: space.sm, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: 22, color: colors.indigo }}>{n}</Text>
              <Text style={kidsText.small}>{l}</Text>
            </View>
          ))}
        </View>
        <K style={{ fontSize: 14, color: colors.muted }}>Moru the peacock · Gita Path Kids · {month}</K>
      </View>

      <KidsButton kind="indigo" icon="share-social" label="Share with family" onPress={share} />
      <KidsButton kind="cream" icon="home" label="Back to the garden" onPress={() => router.dismissTo('/kids/home')} />
    </KidsScreen>
  );
}
