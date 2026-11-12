import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card, Caps, Icon, IconButton, Row, Screen, Stat, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/store';
import { colors, type } from '@/theme';

// A1 · Profile
function MenuRow({ icon, label, sub, onPress }: { icon: IconName; label: string; sub: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ paddingVertical: 12 }}>
      <Row gap={12}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F0F7', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>{label}</Text>
          <Text style={type.small}>{sub}</Text>
        </View>
        <Icon name="chevron-forward" color={colors.muted} />
      </Row>
    </Card>
  );
}

export default function Profile() {
  const auth = useAuth();
  const steps = useApp((s) => s.steps);
  const streak = useApp((s) => s.streak);
  const bookmarks = useApp((s) => s.bookmarks);
  const plan = useApp((s) => s.plan);
  const watched = useApp((s) => s.watched);
  const done = Object.values(steps).filter((s) => s.completedAt).length;
  const chants = Object.values(steps).reduce((a, s) => a + s.chantCount, 0);
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Text style={type.h2}>Profile</Text>
        <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
      </Row>
      <Row gap={14}>
        <Avatar name={auth.session?.name ?? 'P'} size={64} />
        <View>
          <Text style={type.h2}>{auth.session?.name ?? 'Friend'}</Text>
          <Text style={type.bodyMuted}>{plan === 'plus' ? 'Gita Path Plus' : 'Free plan'}{auth.session?.provider === 'guest' ? ' · Guest' : ''}</Text>
        </View>
      </Row>
      <Row gap={8}>
        <Stat value={`${done}`} label="verses learnt" />
        <Stat value={`${streak.longest}`} label="longest streak" color={colors.saffron} />
      </Row>
      <Row gap={8}>
        <Stat value={`${chants}`} label="chants" />
        <Stat value={`${Object.keys(watched).length}`} label="stories watched" />
      </Row>
      <Caps>Your space</Caps>
      <MenuRow icon="happy-outline" label="Kids mode" sub="Stories, shlokas and games for children, with a parent PIN" onPress={() => router.push('/kids')} />
      <MenuRow icon="bookmark-outline" label="Saved and notes" sub={`${Object.keys(bookmarks).length} verses`} onPress={() => router.push('/saved')} />
      <MenuRow icon="download-outline" label="Downloads" sub="Audio and stories on this phone" onPress={() => router.push('/downloads')} />
      <MenuRow icon="search" label="Search" sub="Verses, stories, topics" onPress={() => router.push('/search')} />
      <MenuRow icon="star-outline" label="Gita Path Plus" sub="Unlimited questions and stories" onPress={() => router.push('/subscription')} />
    </Screen>
  );
}
