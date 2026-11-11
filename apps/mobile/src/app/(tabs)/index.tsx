import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { OfflineBanner } from '@/components/States';
import { Button, Caps, Card, Chip, Icon, ProgressBar, Row, Screen, SectionTitle, VerseText, Wrap } from '@/components/ui';
import { MOODS, storyById } from '@/lib/content';
import { actionOfTheDay, pathProgress, verseOfTheDay } from '@/lib/daily';
import { prettyDate } from '@/lib/dates';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, shadow, type } from '@/theme';
import { pushStep } from '@/lib/api';

// D1 · Today
export default function Today() {
  const session = useApp((s) => s.session);
  const steps = useApp((s) => s.steps);
  const streak = useApp((s) => s.streak);
  const markStep = useApp((s) => s.markStep);
  const verse = verseOfTheDay(steps);
  const step = steps[verse.id];
  const progress = pathProgress(steps);
  const story = storyById('ep12');
  const actionDone = !!step?.action;

  return (
    <Screen>
      <OfflineBanner />
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <Text style={type.small}>{prettyDate()}</Text>
          <Text style={type.h1}>Namaste, {session?.name ?? 'friend'}</Text>
        </View>
        <Row gap={8}>
          <Pressable onPress={() => router.push('/streak')} accessibilityRole="button" accessibilityLabel={`${streak.current} day streak`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.saffronTint }}>
            <Icon name="flame" size={16} color={colors.saffron} />
            <Text style={{ fontFamily: fonts.bodyBold, color: colors.saffron, fontSize: 13 }}>{streak.current} days</Text>
          </Pressable>
          <Avatar name={session?.name ?? 'P'} href="/profile" />
        </Row>
      </Row>

      <View style={[{ backgroundColor: colors.indigo, borderRadius: radius.xl, padding: 20, gap: 12 }, shadow.raised]}>
        <Caps color={colors.indigoText}>{`Today's verse · Chapter ${verse.chapter} · Verse ${verse.number}`}</Caps>
        <VerseText lines={verse.sanskrit.slice(0, 1)} color={colors.white} />
        <Text style={[type.body, { color: '#E2E0F8' }]}>{verse.meaning.split('. ')[0]}.</Text>
        <Row gap={10}>
          <Button label="Listen" icon="play" onPress={() => router.push({ pathname: '/verse/[id]', params: { id: verse.id, autoplay: '1' } })} style={{ flex: 1 }} />
          <Button label="Open verse" kind="onDark" onPress={() => router.push({ pathname: '/verse/[id]', params: { id: verse.id } })} style={{ flex: 1 }} />
        </Row>
      </View>

      <Card tone="teal">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: actionDone }}
          onPress={() => { markStep(verse.id, { action: !actionDone }); pushStep(verse.id, { action: !actionDone }); }}
          style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}
        >
          <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: actionDone ? colors.teal : '#9DB9BB', backgroundColor: actionDone ? colors.teal : colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
            {actionDone ? <Icon name="checkmark" size={16} color={colors.white} /> : null}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Caps color={colors.teal}>Today&apos;s action</Caps>
            <Text style={[type.body, { fontFamily: fonts.bodyMedium }]}>{actionOfTheDay(verse)}</Text>
          </View>
        </Pressable>
      </Card>

      <View style={{ gap: 10 }}>
        <SectionTitle>What&apos;s on your mind?</SectionTitle>
        <Wrap>
          {MOODS.map((m) => (
            <Chip key={m} label={m} onPress={() => router.push({ pathname: '/(tabs)/ask', params: { mood: m } })} />
          ))}
        </Wrap>
      </View>

      <Card onPress={() => router.push('/(tabs)/path')}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Caps>Continue your path</Caps>
            <Text style={[type.h3, { marginTop: 4 }]}>Chapter 2 · Sankhya Yoga</Text>
          </View>
          <Text style={type.bodyMuted}>{progress.done} / {progress.total}</Text>
        </Row>
        <View style={{ marginTop: 12 }}>
          <ProgressBar value={progress.done / progress.total} />
        </View>
      </Card>

      {story ? (
        <Card onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })}>
          <Row gap={12}>
            <View style={{ width: 64, height: 48, borderRadius: 12, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" color={colors.goldSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <Caps>Story of the day</Caps>
              <Text style={type.label}>{story.title} · {story.minutes} min</Text>
            </View>
          </Row>
        </Card>
      ) : null}
    </Screen>
  );
}
