// K4 · Story player with Hindi/English captions. Autoplay is always off.
// Studio animations are not produced yet: playback is simulated with the episode's caption timeline.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { K, KidsButton, KidsCard, KidsScreen, kidsText } from '@/components/kids';
import { Icon } from '@/components/ui';
import { episodeFor, shlokaById, storyOfTheDay } from '@/lib/kids/content';
import { useKids } from '@/lib/kids/store';
import { fmt, usePlayer } from '@/lib/usePlayer';
import { storyById } from '@/lib/content';
import { todayKey } from '@/lib/dates';
import { colors, fonts, space } from '@/theme';
import { ChantGateCard, STORY_EMOJI, useStoriesLocked } from '@/components/kidsStory';

export default function KidsPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = storyById(id) ?? storyOfTheDay(todayKey());
  const ep = episodeFor(story.id);
  const narration = useKids((s) => s.settings.narration);
  const [lang, setLang] = useState<'hi' | 'en'>(narration === 'en' ? 'en' : 'hi');
  const locked = useStoriesLocked();
  const duration = story.minutes * 60;
  const player = usePlayer(duration, 1, () => router.replace(`/kids/story-done/${story.id}`));
  const frac = player.position / duration;
  const caption = ep ? [...ep.captions].reverse().find((c) => frac >= c.at) ?? ep.captions[0] : undefined;
  const shloka = ep ? shlokaById(ep.shlokaId) : undefined;

  return (
    <KidsScreen title="Story time" subtitle={`Episode ${story.episode}`} onBack={() => router.back()} tabs={false}>
      {locked ? <ChantGateCard /> : (
        <>
          <View style={{ borderRadius: 32, backgroundColor: '#3B3FA0', padding: space.lg, gap: space.md }}>
            {narration === 'hi+en' ? (
              <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 24, padding: 4 }} accessibilityRole="tablist">
                {(['hi', 'en'] as const).map((l) => (
                  <Pressable key={l} accessibilityRole="tab" accessibilityState={{ selected: lang === l }} onPress={() => setLang(l)}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: lang === l ? '#FFE3B3' : 'transparent' }}>
                    <Text style={{ fontFamily: fonts.kids, fontSize: 16, color: lang === l ? colors.indigo : colors.white }}>{l === 'hi' ? 'हिन्दी' : 'English'}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Pressable accessibilityRole="button" accessibilityLabel={player.playing ? 'Pause story' : 'Play story'} onPress={player.toggle}
              style={{ height: 170, borderRadius: 24, backgroundColor: '#FFE3B3', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 72 }}>{STORY_EMOJI[story.id] ?? '📖'}</Text>
              <View style={{ position: 'absolute', width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center', opacity: player.playing ? 0 : 1 }}>
                <Icon name="play" size={40} color={colors.indigo} />
              </View>
            </Pressable>
            {caption ? (
              <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 18, padding: space.md }} accessibilityLiveRegion="polite">
                <Text style={{ fontFamily: lang === 'hi' ? fonts.verseBold : fonts.kids, fontSize: 20, color: '#FFD27A', textAlign: 'center' }}>{lang === 'hi' ? caption.hi : caption.en}</Text>
                {narration === 'hi+en' ? <Text style={{ fontFamily: fonts.kidsMedium, fontSize: 15, color: colors.white, textAlign: 'center' }}>{lang === 'hi' ? caption.en : caption.hi}</Text> : null}
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text style={{ fontFamily: fonts.kids, color: colors.white }}>{fmt(player.position)}</Text>
              <View style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <View style={{ width: `${frac * 100}%`, height: 12, borderRadius: 6, backgroundColor: '#A7ECEF' }} />
              </View>
              <Text style={{ fontFamily: fonts.kids, color: colors.white }}>{fmt(duration)}</Text>
            </View>
            <KidsButton kind="cream" icon={player.playing ? 'pause' : 'play'} label={player.playing ? 'Pause' : player.position > 0 ? 'Keep watching' : 'Play the story'} onPress={player.toggle} />
          </View>

          <KidsCard>
            <Text style={kidsText.caps}>Krishna story · {story.minutes} min</Text>
            <Text style={kidsText.title}>{story.title}</Text>
            {ep ? (
              <KidsCard tone="cream" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 26 }}>💡</Text>
                <K style={{ flex: 1 }}><Text style={{ fontFamily: fonts.kidsHeavy, color: colors.teal }}>Lesson: </Text>{ep.moral}</K>
              </KidsCard>
            ) : null}
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <Icon name="shield-checkmark-outline" size={20} color={colors.teal} />
              <K style={{ flex: 1, fontSize: 15, color: colors.muted }}>Autoplay is off. The story stops at the end.</K>
            </View>
          </KidsCard>

          {shloka ? (
            <KidsCard tone="cream">
              <Text style={kidsText.h2}>🎵 This story’s shloka</Text>
              <K>{shloka.title} — Gita {shloka.verseId}</K>
              <KidsButton kind="teal" icon="mic" label="Sing it with Moru" onPress={() => router.push(`/kids/sing/${shloka.id}`)} />
            </KidsCard>
          ) : null}
          {frac >= 0.5 ? (
            <Pressable accessibilityRole="button" onPress={() => router.replace(`/kids/story-done/${story.id}`)} style={{ alignSelf: 'center', padding: space.sm }}>
              <Text style={{ fontFamily: fonts.kids, color: colors.muted, textDecorationLine: 'underline' }}>I finished watching</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </KidsScreen>
  );
}
