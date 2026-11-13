import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Caps, Icon, Row, Screen, Stat } from '@/components/ui';
import { chapterByNumber, contentChapters, pathVerses } from '@/lib/content';
import { currentChapter } from '@/lib/daily';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// D6 · Learning path
const OFFSETS = [0, 70, 120, 70, 0, 70, 120, 70];

export default function PathTab() {
  const steps = useApp((s) => s.steps);
  const streak = useApp((s) => s.streak);
  const [n, setN] = useState(() => currentChapter(steps));
  const chapter = chapterByNumber(n)!;
  const verses = pathVerses(n);
  const quiz = () => router.push({ pathname: '/quiz/[chapter]', params: { chapter: String(n) } });
  const doneCount = Object.values(steps).filter((s) => s.completedAt).length;
  const chants = Object.values(steps).reduce((a, s) => a + (s.chantCount ?? 0), 0);
  const currentIndex = verses.findIndex((v) => !steps[v.id]?.completedAt);
  const allDone = currentIndex === -1;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={type.h1}>Your path</Text>
        <Pressable onPress={() => router.push('/search')} accessibilityRole="button" accessibilityLabel="Search verses" style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="search" />
        </Pressable>
      </Row>
      <Row gap={8}>
        <Stat value={`${doneCount}`} label="verses learnt" />
        <Stat value={`${chants}`} label="chanted" />
        <Stat value={`${streak.current}`} label="day streak" color={colors.saffron} />
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {contentChapters().map((c) => {
          const on = c.number === n;
          return (
            <Pressable
              key={c.number}
              onPress={() => setN(c.number)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Chapter ${c.number}, ${c.english}`}
              style={{ minWidth: 40, height: 40, paddingHorizontal: 8, borderRadius: 20, borderWidth: 1, borderColor: on ? colors.saffron : colors.line, backgroundColor: on ? colors.saffron : colors.white, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: on ? colors.white : colors.ink }}>{c.number}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ backgroundColor: colors.indigo, borderRadius: radius.lg, padding: 16, gap: 4 }}>
        <Caps color={colors.indigoText}>{`Chapter ${chapter.number} of 18`}</Caps>
        <Text style={[type.h3, { color: colors.white }]}>{chapter.name} · {chapter.english}</Text>
        <Row gap={16} style={{ marginTop: 6 }}>
          <Pressable onPress={quiz} accessibilityRole="link">
            <Text style={{ color: colors.goldSoft, fontFamily: fonts.bodySemi, fontSize: 13 }}>Chapter quiz</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/saved')} accessibilityRole="link">
            <Text style={{ color: colors.goldSoft, fontFamily: fonts.bodySemi, fontSize: 13 }}>Saved verses</Text>
          </Pressable>
        </Row>
      </View>

      <View style={{ paddingLeft: 60, gap: 8 }}>
        {verses.map((v, i) => {
          const done = !!steps[v.id]?.completedAt;
          const current = i === currentIndex;
          const locked = !done && !current;
          const size = current ? 66 : 54;
          return (
            <Pressable
              key={v.id}
              disabled={locked}
              onPress={() => router.push({ pathname: '/verse/[id]', params: { id: v.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Verse ${v.id}, ${done ? 'completed' : current ? 'current' : 'locked'}`}
              style={{ marginLeft: OFFSETS[i % OFFSETS.length], width: 120, alignItems: 'center' }}
            >
              <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 5, borderColor: done ? colors.teal : current ? colors.goldSoft : '#E7E7EF', backgroundColor: done ? colors.teal : current ? colors.saffron : '#E7E7EF', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={done ? 'checkmark' : current ? 'play' : 'lock-closed'} size={current ? 24 : 20} color={locked ? colors.muted : colors.white} />
              </View>
              <Text style={[type.small, { fontFamily: fonts.bodyBold, color: current ? colors.saffron : colors.muted, marginTop: 4 }]}>
                Verse {v.id}{current ? ' · now' : ''}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={quiz}
          accessibilityRole="button"
          style={{ marginLeft: 70, width: 120, alignItems: 'center' }}
        >
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: allDone ? colors.saffron : '#E7E7EF', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="ribbon" color={allDone ? colors.white : colors.muted} />
          </View>
          <Text style={[type.small, { fontFamily: fonts.bodyBold, marginTop: 4 }]}>Chapter quiz</Text>
        </Pressable>
      </View>
      {verses.length < chapter.verseCount ? <Text style={type.small}>{verses.length} of {chapter.verseCount} verses in Chapter {n} are available so far.</Text> : null}
      {allDone ? <Button label="Take the chapter quiz" onPress={quiz} /> : null}
    </Screen>
  );
}
