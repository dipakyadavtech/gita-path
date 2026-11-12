// K4 list · All kids stories. With the chant gate on, stories wait until today's shloka is sung.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { K, KidsCard, KidsScreen, kidsText } from '@/components/kids';
import { todayKey } from '@/lib/dates';
import { ChantGateCard, STORY_EMOJI, useStoriesLocked } from '@/components/kidsStory';
import { episodeFor, kidsStories, storyOfTheDay } from '@/lib/kids/content';
import { useCurrentKid } from '@/lib/kids/store';
import { colors, fonts, space } from '@/theme';

export default function KidsWatch() {
  const { progress } = useCurrentKid();
  const locked = useStoriesLocked();
  const today = storyOfTheDay(todayKey());
  return (
    <KidsScreen title="Watch" subtitle="Krishna stories">
      {locked ? <ChantGateCard /> : null}
      {kidsStories.map((s) => {
        const seen = !!progress.stories[s.id];
        const ep = episodeFor(s.id);
        return (
          <KidsCard key={s.id} onPress={locked ? undefined : () => router.push(`/kids/watch/${s.id}`)} label={`${s.title}, ${s.minutes} minutes${seen ? ', watched' : ''}`}
            style={[{ flexDirection: 'row', alignItems: 'center' }, locked && { opacity: 0.55 }]}>
            <View style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: '#FFE3B3', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 40 }}>{STORY_EMOJI[s.id] ?? '📖'}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              {s.id === today.id ? <Text style={[kidsText.caps, { color: colors.saffron }]}>Today’s story</Text> : null}
              <Text style={kidsText.h2}>{s.title}</Text>
              <K style={{ fontSize: 15, color: colors.muted }} numberOfLines={2}>{ep?.moral ?? `${s.minutes} min`}</K>
            </View>
            <Text style={{ fontFamily: fonts.kids, color: seen ? colors.teal : colors.indigo, fontSize: 14 }}>{seen ? 'SEEN ✓' : `${s.minutes} MIN`}</Text>
          </KidsCard>
        );
      })}
      <K style={{ color: colors.muted, textAlign: 'center', marginTop: space.sm }}>Stories never play one after another on their own.</K>
    </KidsScreen>
  );
}
