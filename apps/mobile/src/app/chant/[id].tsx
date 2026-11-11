import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Caps, Card, Chip, Icon, Row, Screen, TopBar, Wrap } from '@/components/ui';
import { verseById } from '@/lib/content';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';
import { pushComplete, pushStep } from '@/lib/api';

// D3 · Chant practice. Japa counting works today; pronunciation scoring comes from the
// Python chant-scorer service in Release 2 (FR-CH-02), so feedback here is a practice guide.
const TARGETS = [11, 21, 108];

export default function Chant() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const verse = verseById(id);
  const step = useApp((s) => s.steps[id]);
  const markStep = useApp((s) => s.markStep);
  const completeVerse = useApp((s) => s.completeVerse);
  const [line, setLine] = useState(0);
  const [word, setWord] = useState(0);
  const [listening, setListening] = useState(false);
  const [slow, setSlow] = useState(false);
  const [target, setTarget] = useState(11);
  const count = step?.chantCount ?? 0;

  const words = verse ? verse.sanskrit[line].replace(/[।॥]/g, '').trim().split(/\s+/) : [];

  // Karaoke highlight that walks through the words while "listening".
  useEffect(() => {
    if (!listening) return;
    const t = setInterval(() => {
      setWord((w) => {
        if (w + 1 < words.length) return w + 1;
        setListening(false);
        if (line + 1 < (verse?.sanskrit.length ?? 1)) setLine(line + 1);
        else {
          setLine(0);
          markStep(id, { chantCount: Math.min(count + 1, target) });
        }
        return 0;
      });
    }, slow ? 1100 : 700);
    return () => clearInterval(t);
  }, [listening, slow, words.length, line, count, target, id, markStep, verse]);

  if (!verse) return null;

  const finish = () => {
    markStep(id, { listened: true, understood: true });
    const r = completeVerse(id);
    pushStep(id, { listened: true, understood: true });
    pushComplete(id);
    router.replace({ pathname: '/done', params: { id, streak: String(r.streak) } });
  };

  return (
    <Screen footer={<Button label="Finish today" icon="checkmark" kind="teal" onPress={finish} />}>
      <TopBar title={`Chant practice · ${verse.id}`} />
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }} accessibilityLabel={verse.sanskrit[line]}>
          {words.map((w, i) => {
            const done = i < word;
            const now = i === word && listening;
            return (
              <Text
                key={w + i}
                style={{
                  fontFamily: fonts.verseBold,
                  fontSize: 26,
                  lineHeight: 42,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                  overflow: 'hidden',
                  color: now ? colors.white : done && listening ? colors.teal : colors.ink,
                  backgroundColor: now ? colors.saffron : 'transparent',
                }}
              >
                {w}
              </Text>
            );
          })}
        </View>
        <Text style={[type.small, { textAlign: 'center', marginTop: 8 }]}>Line {line + 1} of {verse.sanskrit.length} · follow the highlight</Text>
      </Card>

      <View style={{ alignItems: 'center', gap: 10 }}>
        <View style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={() => { setWord(0); setListening((l) => !l); }}
            accessibilityRole="button"
            accessibilityLabel={listening ? 'Stop chanting' : 'Start chanting'}
            style={({ pressed }) => ({ width: 108, height: 108, borderRadius: 54, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.96 : 1 }] })}
          >
            <Icon name={listening ? 'stop' : 'mic'} size={42} color={colors.white} />
          </Pressable>
        </View>
        <Text style={type.label}>{listening ? 'Chant along…' : 'Tap and chant one repetition'}</Text>
      </View>

      <Card tone="teal">
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Caps color={colors.teal}>Japa count</Caps>
            <Text style={{ fontFamily: fonts.heading, fontSize: 26, color: colors.ink }}>{count} / {target}</Text>
          </View>
          <Wrap gap={6}>
            {TARGETS.map((t) => (
              <Chip key={t} label={`${t}`} active={target === t} onPress={() => setTarget(t)} />
            ))}
          </Wrap>
        </Row>
        <Text style={[type.body, { marginTop: 10 }]}>
          Tip: hold long vowels such as <Text style={{ fontFamily: fonts.verseBold }}>आ</Text> for two beats, and keep a steady pace.
        </Text>
      </Card>

      <Row gap={10}>
        <Button label={slow ? 'Normal speed' : 'Slow mode'} icon="timer-outline" kind="ghost" onPress={() => setSlow((s) => !s)} style={{ flex: 1 }} />
        <Button label="Hear again" icon="repeat" kind="ghost" onPress={() => router.push({ pathname: '/verse/[id]', params: { id, autoplay: '1' } })} style={{ flex: 1 }} />
      </Row>
      <View style={{ height: 1 }} />
      <Text style={[type.small, { textAlign: 'center', borderRadius: radius.md }]}>Pronunciation scoring arrives in Release 2.</Text>
    </Screen>
  );
}
