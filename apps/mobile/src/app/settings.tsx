import { router, type Href } from 'expo-router';
import { Pressable, Share, Switch, Text, View } from 'react-native';
import { Caps, Icon, Screen, TextLink, TopBar } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/store';
import { colors, radius, type } from '@/theme';

// A2 · Settings (FR-PR-05)
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Caps>{title}</Caps>
      <View style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingHorizontal: 14 }}>{children}</View>
    </View>
  );
}
function Item({ label, value, href, onPress, danger, first, right }: { label: string; value?: string; href?: Href; onPress?: () => void; danger?: boolean; first?: boolean; right?: React.ReactNode }) {
  const press = onPress ?? (href ? () => router.push(href) : undefined);
  return (
    <Pressable disabled={!press} onPress={press} accessibilityRole={press ? 'button' : undefined} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 50, borderTopWidth: first ? 0 : 1, borderColor: colors.line }}>
      <Text style={[type.body, { flex: 1, color: danger ? colors.danger : colors.ink }]}>{label}</Text>
      {value ? <Text style={type.bodyMuted}>{value}</Text> : null}
      {right}
      {press ? <Icon name="chevron-forward" size={16} color={colors.muted} /> : null}
    </Pressable>
  );
}

const REMINDERS = ['6:00 am', '7:00 am', '8:00 am', '9:00 pm'];
const MINUTES = [5, 10, 15] as const;

export default function Settings() {
  const auth = useAuth();
  const state = useApp();
  const { prefs, setPrefs, streak, plan, circle } = state;

  const exportData = () => {
    const { session, prefs: p, steps, streak: st, bookmarks, quiz, plan: pl, watched, circle: c } = useApp.getState();
    Share.share({ message: JSON.stringify({ exportedAt: new Date().toISOString(), session, prefs: p, steps, streak: st, bookmarks, quiz, plan: pl, watched, circle: c }, null, 2) });
  };

  return (
    <Screen>
      <TopBar title="Settings" />
      <Group title="Daily practice">
        <Item first label="Reminder time" value={prefs.reminderTime} onPress={() => setPrefs({ reminderTime: REMINDERS[(REMINDERS.indexOf(prefs.reminderTime) + 1) % REMINDERS.length] })} />
        <Item label="Daily time" value={`${prefs.dailyMinutes} min`} onPress={() => setPrefs({ dailyMinutes: MINUTES[(MINUTES.indexOf(prefs.dailyMinutes) + 1) % MINUTES.length] })} />
        <Item label="Reminders on" right={<Switch value={!!prefs.notificationsAllowed} onValueChange={(v) => setPrefs({ notificationsAllowed: v })} trackColor={{ true: colors.teal, false: '#CFCFDA' }} accessibilityLabel="Reminders on" />} />
        <Item label="Streak freeze" value={`${streak.freezes} left this week`} />
      </Group>
      <Group title="Language and audio">
        <Item first label="App language" value={prefs.appLanguage} href="/languages" />
        <Item label="Verse script" value={prefs.verseScript} href="/languages" />
        <Item label="Narration" value={prefs.narration} href="/languages" />
      </Group>
      <Group title="Family and kids">
        <Item first label="Family Circle" value={circle?.name ?? 'Not set up'} href="/(tabs)/circle" />
        <Item label="Kids profiles and PIN" href="/kids" />
      </Group>
      <Group title="Account and privacy">
        <Item first label="Subscription" value={plan === 'plus' ? 'Plus' : 'Free'} href="/subscription" />
        <Item label="Download my data" value="JSON" onPress={exportData} />
        <Item label="Delete account" href="/delete-account" danger />
      </Group>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextLink label="Help and feedback" onPress={() => Share.share({ message: 'Feedback for Gita Path: ' })} />
        <TextLink label="Sign out" onPress={auth.signOut} color={colors.muted} />
      </View>
    </Screen>
  );
}
