import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Share, Text, View } from 'react-native';
import { Button, Caps, Card, Icon, Row, Screen, TopBar } from '@/components/ui';
import { MAX_MEMBERS, inviteLink, newCircle } from '@/lib/circle';
import { useApp } from '@/lib/store';
import { colors, fonts, type } from '@/theme';

// F2 · Invite (link expires in 7 days; owner approves each member, FR-FC-06)
export default function Invite() {
  const session = useApp((s) => s.session)!;
  const circle = useApp((s) => s.circle);
  const setCircle = useApp((s) => s.setCircle);
  const [copied, setCopied] = useState(false);
  const fresh = useMemo(() => newCircle({ id: session.userId, name: session.name }, 'Our Family'), [session.userId, session.name]);
  const c = circle ?? fresh;
  useEffect(() => {
    if (!circle) setCircle(fresh);
  }, [circle, fresh, setCircle]);
  const link = inviteLink(c);
  const message = `Join my Gita Path Family Circle "${c.name}" and let's learn the Bhagavad Gita together: ${link}`;
  const pending = c.members.filter((m) => m.status === 'pending');

  return (
    <Screen footer={<Button label="Go to my Circle" onPress={() => router.replace('/(tabs)/circle')} />}>
      <TopBar title="Invite your family" />
      <Card>
        <Caps>Circle name</Caps>
        <Text style={[type.h2, { marginTop: 4 }]}>{c.name}</Text>
        <Text style={type.small}>{c.members.filter((m) => m.status === 'member').length} of {MAX_MEMBERS} members · {c.challenge.title}</Text>
      </Card>
      <Card>
        <Caps>Invite link</Caps>
        <Row gap={8} style={{ marginTop: 8, paddingHorizontal: 12, height: 48, borderRadius: 12, backgroundColor: '#F1F0F7' }}>
          <Text style={[type.body, { flex: 1 }]} numberOfLines={1}>{link.replace('https://', '')}</Text>
          <Icon name={copied ? 'checkmark' : 'copy-outline'} color={copied ? colors.teal : colors.ink} />
        </Row>
        <Text style={[type.small, { marginTop: 6 }]}>Link expires in 7 days. You approve every new member.</Text>
      </Card>
      <Row gap={8}>
        <Button label="WhatsApp" icon="logo-whatsapp" kind="ghost" style={{ flex: 1 }} onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`)} />
        <Button label="Share" icon="share-outline" kind="ghost" style={{ flex: 1 }} onPress={() => Share.share({ message })} />
        <Button label={copied ? 'Copied' : 'Copy'} icon="copy-outline" kind="ghost" style={{ flex: 1 }} onPress={async () => { await Clipboard.setStringAsync(link); setCopied(true); }} />
      </Row>
      {pending.length ? (
        <Card>
          <Caps>Waiting for approval</Caps>
          {pending.map((m) => (
            <Text key={m.id} style={[type.body, { marginTop: 8 }]}>{m.name}</Text>
          ))}
        </Card>
      ) : null}
      <Button label="Preview what they will see" kind="ghost" onPress={() => router.push({ pathname: '/join/[code]', params: { code: c.code } })} />
      <View style={{ height: 1 }} />
      <Text style={[type.small, { fontFamily: fonts.body }]}>Members see streaks, verses completed and stories watched. Never your notes or questions.</Text>
    </Screen>
  );
}
