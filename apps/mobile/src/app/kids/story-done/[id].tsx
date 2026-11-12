// K5 · Story finished: stars, any new sticker, the lesson, and the next step.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Buddy, K, KidsButton, KidsCard, KidsScreen, kidsText, StarPill } from '@/components/kids';
import { storyById } from '@/lib/content';
import { episodeFor, shlokaById, stickers } from '@/lib/kids/content';
import { useKids } from '@/lib/kids/store';
import { pushProgress } from '@/lib/kids/sync';
import { colors, space } from '@/theme';

export default function StoryDone() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = storyById(id);
  const ep = episodeFor(id);
  const award = useKids((s) => s.award);
  const currentId = useKids((s) => s.currentId);
  const [result, setResult] = useState<{ stars: number; gained: number; newStickers: string[] } | null>(null);
  const once = useRef(false);

  useEffect(() => {
    if (once.current || !story) return;
    once.current = true;
    const r = award('story', story.id);
    if (currentId) pushProgress(currentId, 'story', story.id, r.gained);
    // Show the result after the award is stored (state update outside render).
    void Promise.resolve().then(() => setResult(r));
  }, [award, story, currentId]);

  if (!story) return null;
  const sticker = result?.newStickers.map((s) => stickers.find((x) => x.id === s)).find(Boolean);
  const shloka = ep ? shlokaById(ep.shlokaId) : undefined;

  return (
    <KidsScreen title="Story complete!" tabs={false}>
      <KidsCard style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 64 }} accessibilityElementsHidden>🎉</Text>
        <Text style={[kidsText.hero, { textAlign: 'center' }]}>Wonderful watching!</Text>
        <K style={{ textAlign: 'center' }}>You finished “{story.title}”.</K>
        {result ? <StarPill stars={result.stars} label={`+${result.gained} stars`} /> : null}
      </KidsCard>

      {sticker ? (
        <KidsCard tone="sun" style={{ alignItems: 'center' }}>
          <Text style={kidsText.caps}>New sticker!</Text>
          <Text style={{ fontSize: 64 }}>{sticker.emoji}</Text>
          <Text style={kidsText.title}>{sticker.name}</Text>
          <KidsButton small kind="cream" label="Open my sticker book" onPress={() => router.push('/kids/stickers')} />
        </KidsCard>
      ) : null}

      {ep ? <Buddy>{ep.moral}</Buddy> : null}

      <View style={{ gap: space.md }}>
        {shloka ? <KidsButton kind="teal" icon="mic" label={`Sing “${shloka.title}”`} onPress={() => router.replace(`/kids/sing/${shloka.id}`)} /> : null}
        <KidsButton kind="cream" icon="home" label="Back to Moru’s garden" onPress={() => router.dismissTo('/kids/home')} />
      </View>
      <K style={{ color: colors.muted, textAlign: 'center', fontSize: 14 }}>The next story won’t start by itself.</K>
    </KidsScreen>
  );
}
