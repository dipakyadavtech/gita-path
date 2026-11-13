import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Caps, Chip, Icon, Row, Wrap } from '@/components/ui';
import { storyById, verseById } from '@/lib/content';
import { useVerseMedia } from '@/lib/audio';
import { VideoView } from 'expo-video';
import { useApp } from '@/lib/store';
import { fmt, usePlayer } from '@/lib/usePlayer';
import { colors, fonts, radius, type } from '@/theme';

// E5 · Story player. Until the animation studio delivers episodes, it plays the recitation video of
// the episode's verse (verse 1.1, the start of the Gita, for episodes without one). With no video it
// falls back to the drawn placeholder and simulated timing.
export default function StoryPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = storyById(id);
  const markWatched = useApp((s) => s.markWatched);
  const plan = useApp((s) => s.plan);
  const setDownload = useApp((s) => s.setDownload);
  const downloaded = useApp((s) => !!s.downloads[id]);
  const [subs, setSubs] = useState('हिन्दी');
  const media = useVerseMedia(verseById(story?.verseId ?? '1.1'));
  const player = usePlayer((story?.minutes ?? 3) * 60, media.video ? 1 : 4, () => story && markWatched(story.id), null, media.video);
  if (!story) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0E0C24' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }}>
        <Row style={{ justifyContent: 'space-between', padding: 16 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close player" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-down" color={colors.white} />
          </Pressable>
          <Text style={[type.small, { color: colors.indigoText }]}>Episode {story.episode} · {story.minutes} min</Text>
          <Pressable
            onPress={() => (plan === 'plus' ? setDownload(story.id, { title: story.title, mb: 45 }) : router.push('/subscription'))}
            accessibilityRole="button"
            accessibilityLabel={downloaded ? 'Downloaded' : 'Download episode'}
            style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={downloaded ? 'checkmark' : 'download-outline'} color={colors.white} />
          </Pressable>
        </Row>
        {player.video ? (
          <VideoView player={player.video} nativeControls={false} contentFit="contain" accessibilityLabel={`Episode ${story.episode} video`} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }} />
        ) : (
        <View style={{ height: 220, backgroundColor: '#2E2A6E', overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: -30, bottom: -50, width: 220, height: 120, borderRadius: 110, backgroundColor: colors.indigoSoft }} />
          <View style={{ position: 'absolute', right: 60, top: 30, width: 46, height: 46, borderRadius: 23, backgroundColor: colors.goldSoft }} />
          <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12, padding: 6, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <Text style={{ textAlign: 'center', color: colors.white, fontFamily: fonts.verseBold }}>{subs === 'हिन्दी' ? 'मैं युद्ध नहीं करूँगा, गोविन्द।' : '“I will not fight, Govinda.”'}</Text>
          </View>
        </View>
        )}
        <View style={{ padding: 18, gap: 12 }}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.indigoSoft }}>
            <View style={{ width: `${(player.position / player.duration) * 100}%`, height: 6, borderRadius: 3, backgroundColor: colors.goldSoft }} />
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={[type.small, { color: colors.indigoText }]}>{fmt(player.position)}</Text>
            <Text style={[type.small, { color: colors.indigoText }]}>{fmt(player.duration)}</Text>
          </Row>
          <Row gap={28} style={{ justifyContent: 'center' }}>
            <Pressable onPress={() => player.seek(player.position - 10)} accessibilityLabel="Back 10 seconds" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.white, fontFamily: fonts.bodyBold }}>-10</Text>
            </Pressable>
            <Pressable onPress={player.toggle} accessibilityLabel={player.playing ? 'Pause' : 'Play'} style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={player.playing ? 'pause' : 'play'} size={28} color={colors.white} />
            </Pressable>
            <Pressable onPress={() => player.seek(player.position + 10)} accessibilityLabel="Forward 10 seconds" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.white, fontFamily: fonts.bodyBold }}>+10</Text>
            </Pressable>
          </Row>
          <Text style={[type.h2, { color: colors.white }]}>{story.title}</Text>
          <Wrap>
            {['हिन्दी', 'English'].map((l) => (
              <Chip key={l} label={`Subtitles: ${l}`} active={subs === l} onPress={() => setSubs(l)} />
            ))}
          </Wrap>
          {story.scenes ? (
            <View style={{ gap: 4 }}>
              <Caps color={colors.indigoText}>Scenes</Caps>
              {story.scenes.map(([t, name], i) => (
                <Row key={t} gap={12} style={{ padding: 10, borderRadius: 12, backgroundColor: i === 0 ? '#2E2A6E' : 'transparent' }}>
                  <Text style={[type.small, { color: colors.indigoText, width: 40 }]}>{t}</Text>
                  <Text style={[type.body, { color: colors.white }]}>{i + 1}. {name}</Text>
                </Row>
              ))}
            </View>
          ) : null}
          {story.verseId ? (
            <Pressable onPress={() => router.push({ pathname: '/verse/[id]', params: { id: story.verseId! } })} accessibilityRole="link" style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.indigo, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[type.label, { color: colors.white }]}>This episode ends with verse {story.verseId}</Text>
              <Icon name="chevron-forward" color={colors.goldSoft} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
