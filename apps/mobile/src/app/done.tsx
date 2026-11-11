import { router, useLocalSearchParams } from 'expo-router';
import { Share, Text, View } from 'react-native';
import { Button, Caps, Card, Icon, Row, Screen, Stat } from '@/components/ui';
import { verseById } from '@/lib/content';
import { actionOfTheDay } from '@/lib/daily';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// D4 · Done for today (with evening check-in, FR-HM-06)
const MILESTONES = [7, 21, 50, 108];

export default function Done() {
  const { id, streak } = useLocalSearchParams<{ id: string; streak: string }>();
  const verse = verseById(id)!;
  const step = useApp((s) => s.steps[id]);
  const markStep = useApp((s) => s.markStep);
  const reminder = useApp((s) => s.prefs.reminderTime);
  const days = Number(streak) || 1;

  const share = () => Share.share({ message: `${verse.sanskrit.join('\n')}\n\n${verse.meaning}\n— Bhagavad Gita ${verse.id}, via Gita Path` });

  return (
    <Screen
      footer={
        <Row gap={10}>
          <Button label="Share verse card" icon="share-outline" kind="ghost" onPress={share} style={{ flex: 1 }} />
          <Button label="Back home" onPress={() => (MILESTONES.includes(days) ? router.replace({ pathname: '/streak', params: { days: String(days) } }) : router.replace('/(tabs)'))} style={{ flex: 1 }} />
        </Row>
      }
    >
      <View style={{ alignItems: 'center', gap: 10, marginTop: 8 }}>
        <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="checkmark" size={52} color={colors.white} />
        </View>
        <Text style={type.h1}>Done for today</Text>
        <Text style={type.bodyMuted}>Verse {verse.id} complete</Text>
      </View>
      <Row gap={8}>
        <Stat value="✓" label="Listened" color={colors.teal} />
        <Stat value="✓" label="Understood" color={colors.teal} />
        <Stat value={`${step?.chantCount ?? 0}×`} label="Chanted" />
      </Row>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.saffronTint }}>
        <Icon name="flame" color={colors.saffron} />
        <Text style={{ fontFamily: fonts.bodyBold, color: colors.saffron, fontSize: 15 }}>{days}-day streak · see you tomorrow at {reminder}</Text>
      </View>
      <Card tone="teal">
        <Caps color={colors.teal}>Evening check-in</Caps>
        <Text style={[type.body, { fontFamily: fonts.bodySemi, marginTop: 6 }]}>{actionOfTheDay(verse)} Did you manage it?</Text>
        {step?.actionCheckIn ? (
          <Text style={[type.label, { color: colors.teal, marginTop: 12 }]}>
            {step.actionCheckIn === 'yes' ? 'Wonderful. That is the Gita in action.' : 'That is fine. Tomorrow is a new chance.'}
          </Text>
        ) : (
          <Row gap={8} style={{ marginTop: 12 }}>
            <Button label="Yes, I did" kind="teal" onPress={() => markStep(id, { actionCheckIn: 'yes', action: true })} style={{ flex: 1 }} />
            <Button label="Not today" kind="ghost" onPress={() => markStep(id, { actionCheckIn: 'no' })} style={{ flex: 1 }} />
          </Row>
        )}
      </Card>
      <Button label="Preview 21-day milestone" kind="ghost" onPress={() => router.push({ pathname: '/streak', params: { days: '21' } })} />
    </Screen>
  );
}
