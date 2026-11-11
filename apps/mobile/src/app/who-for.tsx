import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Icon, Screen, type IconName } from '@/components/ui';
import { useApp } from '@/lib/store';
import type { WhoFor } from '@/lib/types';
import { colors, radius, type } from '@/theme';

// S5 · Who is this for
const options: { id: WhoFor; icon: IconName; title: string; sub: string }[] = [
  { id: 'me', icon: 'person-outline', title: 'Just me', sub: 'Daily verse, chanting and Ask the Gita' },
  { id: 'me-and-child', icon: 'people-outline', title: 'Me and my child', sub: 'Your path plus a Kids profile with time limits' },
  { id: 'family', icon: 'heart-outline', title: 'Our whole family', sub: 'Create a Family Circle and invite up to 7 people' },
];

export default function WhoForScreen() {
  const current = useApp((s) => s.prefs.whoFor);
  const setPrefs = useApp((s) => s.setPrefs);
  const pick = (id: WhoFor) => {
    setPrefs({ whoFor: id });
    router.push('/goals');
  };
  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={type.h1}>Who will use Gita Path?</Text>
        <Text style={type.bodyMuted}>We&apos;ll set things up to match.</Text>
      </View>
      {options.map((o) => {
        const on = current === o.id;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => pick(o.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: radius.xl, backgroundColor: on ? colors.saffronTint : colors.white, borderWidth: on ? 2 : 1, borderColor: on ? colors.saffron : colors.line }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: on ? colors.saffron : colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={o.icon} size={26} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.h3}>{o.title}</Text>
              <Text style={type.bodyMuted}>{o.sub}</Text>
            </View>
            <Icon name="chevron-forward" color={colors.muted} />
          </Pressable>
        );
      })}
      <Text style={type.small}>Kids profiles are created and controlled by a parent. Children cannot sign up on their own.</Text>
    </Screen>
  );
}
