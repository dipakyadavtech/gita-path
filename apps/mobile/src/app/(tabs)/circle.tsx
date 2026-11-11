import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button, Caps, Card, Field, Icon, ProgressBar, Row, Screen } from '@/components/ui';
import { authMode } from '@/lib/auth';
import { approve, newCircle, removeMember, simulateJoinRequest, timeAgo } from '@/lib/circle';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// F1 · Family Circle (no ranking of individuals, FR-FC-03)
export default function CircleTab() {
  const session = useApp((s) => s.session);
  const circle = useApp((s) => s.circle);
  const setCircle = useApp((s) => s.setCircle);
  const steps = useApp((s) => s.steps);
  const whoFor = useApp((s) => s.prefs.whoFor);
  const [name, setName] = useState('Our Family');
  const myDone = Object.values(steps).filter((s) => s.completedAt).length;

  if (!circle) {
    return (
      <Screen>
        <Text style={type.h1}>Family Circle</Text>
        <Card tone="indigo" style={{ gap: 8 }}>
          <Caps color={colors.indigoText}>Learn together</Caps>
          <Text style={[type.h3, { color: colors.white, fontSize: 18 }]}>Finish Chapter 2 together with up to 7 people</Text>
          <Text style={[type.body, { color: '#E2E0F8' }]}>Everyone sees streaks and verses completed. Notes and Ask the Gita questions always stay private.</Text>
        </Card>
        <Field label="Circle name" value={name} onChangeText={setName} />
        <Button label="Create my Circle" icon="people" onPress={() => { setCircle(newCircle({ id: session!.userId, name: session!.name }, name.trim() || 'Our Family')); router.push('/invite'); }} />
        {whoFor === 'me-and-child' ? <Button label="Set up a Kids profile" kind="ghost" icon="happy-outline" onPress={() => router.push('/kids')} /> : null}
      </Screen>
    );
  }

  const members = circle.members.map((m) => (m.isMe ? { ...m, done: myDone } : m));
  const active = members.filter((m) => m.status === 'member');
  const pending = members.filter((m) => m.status === 'pending');
  const total = active.reduce((a, m) => a + m.done, 0);
  const target = circle.challenge.target * Math.max(1, active.length);
  const isOwner = circle.ownerId === session?.userId;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={type.h1}>{circle.name}</Text>
        <Button label="Invite" icon="add" kind="ghost" onPress={() => router.push('/invite')} />
      </Row>
      <Card tone="indigo" style={{ gap: 10 }}>
        <Caps color={colors.indigoText}>Circle challenge</Caps>
        <Text style={[type.h3, { color: colors.white, fontSize: 18 }]}>{circle.challenge.title}</Text>
        <Text style={[type.small, { color: '#E2E0F8' }]}>{total} of {target} verse-steps done</Text>
        <ProgressBar value={total / target} color={colors.goldSoft} track={colors.indigoSoft} />
      </Card>

      {pending.length && isOwner ? (
        <Card tone="saffron" style={{ gap: 10 }}>
          <Caps color={colors.saffron}>Waiting for your approval</Caps>
          {pending.map((m) => (
            <Row key={m.id} gap={10}>
              <Avatar name={m.name} color={m.color} size={36} />
              <Text style={[type.label, { flex: 1 }]}>{m.name}</Text>
              <Button label="Approve" kind="teal" onPress={() => setCircle(approve(circle, m.id))} />
              <Pressable onPress={() => setCircle(removeMember(circle, m.id))} accessibilityLabel={`Decline ${m.name}`} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" color={colors.muted} />
              </Pressable>
            </Row>
          ))}
        </Card>
      ) : null}

      <Card style={{ gap: 14 }}>
        {active.map((m) => (
          <Row key={m.id} gap={12}>
            <Avatar name={m.name} color={m.color} size={36} />
            <View style={{ flex: 1, gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={type.label}>{m.name}{m.isMe ? ' (you)' : ''}</Text>
                <Text style={type.small}>{m.done} / {circle.challenge.target}</Text>
              </Row>
              <ProgressBar value={m.done / circle.challenge.target} color={m.color} />
            </View>
          </Row>
        ))}
      </Card>

      <Pressable onPress={() => router.push('/kids')} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: '#FFF4D6', borderWidth: 1, borderColor: '#F5C451' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.peacock, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="happy-outline" color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>Kids profiles</Text>
          <Text style={type.small}>Stories and shloka songs for ages 3–12</Text>
        </View>
        <Text style={{ fontFamily: fonts.bodyBold, color: colors.saffron }}>Open Kids mode</Text>
      </Pressable>

      <Card>
        <Caps>This week</Caps>
        {circle.feed.slice(0, 5).map((f, i) => (
          <Row key={i} style={{ justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: colors.line, marginTop: i ? 0 : 6 }}>
            <Text style={type.body}><Text style={{ fontFamily: fonts.bodyBold }}>{f.who}</Text> {f.what}</Text>
            <Text style={type.small}>{timeAgo(f.at)}</Text>
          </Row>
        ))}
      </Card>
      {authMode === 'dev' && isOwner ? (
        <Button label="Dev: simulate a family member joining" kind="ghost" onPress={() => setCircle(simulateJoinRequest(circle, ['Papa', 'Aai', 'Rohan', 'Didi'][circle.members.length % 4]))} />
      ) : null}
    </Screen>
  );
}
