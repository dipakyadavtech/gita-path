import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, Icon, Screen, TextLink, type IconName } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, type } from '@/theme';

// S4 · Permissions (explained before any system prompt)
function PermissionCard({ icon, title, why, allowed, onAllow }: { icon: IconName; title: string; why: string; allowed: boolean | null; onAllow: () => void }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={24} color={colors.saffron} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={type.h3}>{title}</Text>
          <Text style={type.bodyMuted}>{why}</Text>
          <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
            {allowed ? (
              <Text style={[type.label, { color: colors.teal }]}>Allowed</Text>
            ) : (
              <Button label={`Allow ${title.toLowerCase().includes('mic') ? 'microphone' : 'notifications'}`} kind="dark" onPress={onAllow} />
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

export default function Permissions() {
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  // The real OS prompts (expo-notifications / microphone) are requested the first time the feature is used.
  const next = () => router.replace('/who-for');
  return (
    <Screen footer={<><Button label="Continue" onPress={next} /><TextLink label="Not now" onPress={next} color={colors.muted} /></>}>
      <View style={{ gap: 6 }}>
        <Text style={type.h1}>Two quick permissions</Text>
        <Text style={type.bodyMuted}>You can change these any time in Settings. The app works without them.</Text>
      </View>
      <PermissionCard icon="notifications-outline" title="Daily reminder" why="One gentle reminder at your chosen time, never more than 2 a day." allowed={prefs.notificationsAllowed} onAllow={() => setPrefs({ notificationsAllowed: true })} />
      <PermissionCard icon="mic-outline" title="Microphone for chanting" why="Used only while you hold the mic button in Chant practice. Recordings stay on your phone." allowed={prefs.micAllowed} onAllow={() => setPrefs({ micAllowed: true })} />
    </Screen>
  );
}
