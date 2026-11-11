import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Waveform } from '@/components/Waveform';
import { Button, Caps, Card, Icon, IconButton, Row, Screen, TopBar, VerseText } from '@/components/ui';
import { verseById } from '@/lib/content';
import { useApp } from '@/lib/store';
import { fmt, usePlayer } from '@/lib/usePlayer';
import { colors, fonts, radius, type } from '@/theme';

// D2 · Verse detail
const SPEEDS = [0.75, 1, 1.25];

export default function VerseScreen() {
  const { id, autoplay } = useLocalSearchParams<{ id: string; autoplay?: string }>();
  const verse = verseById(id);
  const markStep = useApp((s) => s.markStep);
  const bookmarked = useApp((s) => !!s.bookmarks[id]);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const [speed, setSpeed] = useState(0.75);
  const player = usePlayer(58, speed, () => markStep(id, { listened: true }));

  useEffect(() => {
    if (autoplay && !player.playing) player.toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!verse) {
    return (
      <Screen>
        <TopBar title="Verse" />
        <Text style={type.body}>This verse is not available yet.</Text>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Row gap={10}>
          <Button label="Chant it" icon="mic" onPress={() => { markStep(id, { understood: true }); router.push({ pathname: '/chant/[id]', params: { id } }); }} style={{ flex: 1 }} />
          <Button label="Ask about it" icon="chatbubble-ellipses-outline" kind="ghost" onPress={() => router.push({ pathname: '/(tabs)/ask', params: { verse: id } })} style={{ flex: 1 }} />
        </Row>
      }
    >
      <TopBar
        title={`Chapter ${verse.chapter} · Verse ${verse.number}`}
        right={<IconButton icon={bookmarked ? 'bookmark' : 'bookmark-outline'} label={bookmarked ? 'Remove bookmark' : 'Save verse'} onPress={() => toggleBookmark(id)} />}
      />
      <Card>
        <VerseText lines={verse.sanskrit} center />
        <Text style={[type.bodyMuted, { textAlign: 'center', fontStyle: 'italic', marginTop: 8 }]}>{verse.iast}</Text>
      </Card>

      <Row gap={12} style={{ backgroundColor: colors.indigo, borderRadius: radius.lg, padding: 12 }}>
        <Pressable onPress={player.toggle} accessibilityRole="button" accessibilityLabel={player.playing ? 'Pause recitation' : 'Play recitation'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={player.playing ? 'pause' : 'play'} color={colors.white} />
        </Pressable>
        <Waveform progress={player.position / player.duration} />
        <Text style={[type.small, { color: '#E2E0F8' }]}>{fmt(player.position)} / {fmt(player.duration)}</Text>
        <Pressable
          onPress={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${speed} times`}
          style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.indigoSoft }}
        >
          <Text style={{ color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 }}>{speed}×</Text>
        </Pressable>
      </Row>

      <View style={{ gap: 8 }}>
        <Caps>Word by word</Caps>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {verse.words.map(([dev, iast, gloss]) => (
            <View key={dev + iast} style={{ width: '31.5%', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 10 }}>
              <Text style={{ fontFamily: fonts.verseBold, fontSize: 15, color: colors.ink }}>{dev}</Text>
              <Text style={[type.small, { fontStyle: 'italic' }]}>{iast}</Text>
              <Text style={type.small}>{gloss}</Text>
            </View>
          ))}
        </View>
      </View>

      <Card>
        <Caps>Meaning</Caps>
        <Text style={[type.body, { marginTop: 6 }]}>{verse.meaning}</Text>
        <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.saffronTint, gap: 4 }}>
          <Caps color={colors.saffron}>In your life</Caps>
          <Text style={type.body}>{verse.lifeNote}</Text>
        </View>
      </Card>
    </Screen>
  );
}
