import { router, useLocalSearchParams } from 'expo-router';
import { Share, Text, View } from 'react-native';
import { Button, Caps, Card, Icon, Row, Screen, Stat } from '@/components/ui';
import { chapterByNumber } from '@/lib/content';
import { useApp } from '@/lib/store';
import { colors, radius, type } from '@/theme';

// D8 · Chapter complete
export default function ChapterComplete() {
  const { chapter } = useLocalSearchParams<{ chapter: string }>();
  const n = Number(chapter);
  const c = chapterByNumber(n);
  const nextC = chapterByNumber(n + 1);
  const quiz = useApp((s) => s.quiz[n]);
  const steps = useApp((s) => s.steps);
  const verses = Object.entries(steps).filter(([id, s]) => id.startsWith(`${n}.`) && s.completedAt).length;
  const chants = Object.entries(steps).filter(([id]) => id.startsWith(`${n}.`)).reduce((a, [, s]) => a + s.chantCount, 0);
  if (!c) return null;
  return (
    <Screen footer={<Button label={nextC ? `Start Chapter ${nextC.number}` : 'Back to path'} onPress={() => router.replace('/(tabs)/path')} />}>
      <View style={{ backgroundColor: colors.indigo, borderRadius: radius.xl, padding: 26, alignItems: 'center', gap: 10 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.indigoSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="star" size={40} color={colors.goldSoft} />
        </View>
        <Caps color={colors.indigoText}>{`Chapter ${n} of 18 complete`}</Caps>
        <Text style={[type.h1, { color: colors.white }]}>{c.name}</Text>
        <Text style={[type.body, { color: '#E2E0F8' }]}>{c.english} · {c.verseCount} verses</Text>
      </View>
      <Row gap={8}>
        <Stat value={`${verses}`} label="verses" />
        <Stat value={`${chants}`} label="chants" />
        <Stat value={quiz ? `${quiz.correct}/${quiz.total}` : '—'} label="quiz" color={colors.teal} />
      </Row>
      <Card onPress={() => Share.share({ message: `I completed Chapter ${n}, ${c.name}, of the Bhagavad Gita on Gita Path.` })}>
        <Row gap={12}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="ribbon-outline" color={colors.saffron} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.label}>Your chapter certificate</Text>
            <Text style={type.small}>Share it as an image or message</Text>
          </View>
          <Icon name="share-outline" color={colors.muted} />
        </Row>
      </Card>
      {nextC ? (
        <Card>
          <Caps>Up next</Caps>
          <Text style={[type.h3, { marginTop: 4 }]}>Chapter {nextC.number} · {nextC.name}</Text>
          <Text style={type.bodyMuted}>{nextC.english} · {nextC.verseCount} verses</Text>
        </Card>
      ) : null}
    </Screen>
  );
}
