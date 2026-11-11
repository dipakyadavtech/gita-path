import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button, Caps, Card, ProgressBar, Screen } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, type } from '@/theme';

// F3 · Join a Circle (invitee preview with privacy statement, FR-FC-07)
export default function Join() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const circle = useApp((s) => s.circle);
  const known = circle && circle.code === code ? circle : null;
  const name = known?.name ?? 'a Family Circle';
  const members = known?.members.filter((m) => m.status === 'member') ?? [];
  const owner = members[0]?.name ?? 'A family member';

  return (
    <Screen
      footer={
        <>
          <Button label={`Request to join ${known ? known.name : ''}`.trim()} onPress={() => router.replace('/(tabs)/circle')} />
          <Button label="Not now" kind="ghost" onPress={() => router.replace('/(tabs)')} />
        </>
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
        {members.slice(0, 5).map((m, i) => (
          <View key={m.id} style={{ marginLeft: i ? -10 : 0, borderWidth: 3, borderColor: colors.canvas, borderRadius: 30 }}>
            <Avatar name={m.name} color={m.color} size={52} />
          </View>
        ))}
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={type.bodyMuted}>{owner} invited you to join</Text>
        <Text style={[type.display, { textAlign: 'center' }]}>{name}</Text>
      </View>
      {known ? (
        <Card>
          <Caps>Circle challenge</Caps>
          <Text style={[type.h3, { marginTop: 4 }]}>{known.challenge.title}</Text>
          <View style={{ marginTop: 10 }}>
            <ProgressBar value={0.27} />
          </View>
        </Card>
      ) : null}
      <Card>
        <Text style={type.bodyMuted}>Members see your streak, verses completed and stories watched. They never see your notes or your Ask the Gita questions. The Circle owner approves your request.</Text>
      </Card>
    </Screen>
  );
}
