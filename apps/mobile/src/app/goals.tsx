import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button, Caps, Chip, Icon, Screen, Wrap } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, radius, type } from '@/theme';

// S6 · Goals and time
const QUICK_LANGS = ['हिन्दी', 'English', 'मराठी', 'தமிழ்', 'తెలుగు', 'বাংলা'];
const GOALS = ['Stress and anxiety', 'Career and purpose', 'Relationships', 'Discipline and habits', 'Just curious about the Gita'];

export default function Goals() {
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const toggle = (g: string) => setPrefs({ goals: prefs.goals.includes(g) ? prefs.goals.filter((x) => x !== g) : [...prefs.goals, g] });
  const start = () => {
    setPrefs({ onboarded: true });
    if (prefs.whoFor === 'family') router.replace('/(tabs)/circle');
    else router.replace('/(tabs)');
  };
  return (
    <Screen footer={<Button label="Start my path" icon="arrow-forward" onPress={start} />}>
      <View style={{ gap: 6 }}>
        <Text style={type.display}>One verse a day.{'\n'}A calmer, clearer you.</Text>
        <Text style={type.bodyMuted}>Learn the Bhagavad Gita in 10 minutes a day, with stories, chanting and answers to your real problems.</Text>
      </View>
      <View style={{ gap: 10 }}>
        <Caps>Your language</Caps>
        <Wrap>
          {QUICK_LANGS.map((l) => (
            <Chip key={l} label={l} active={prefs.appLanguage === l} onPress={() => setPrefs({ appLanguage: l })} />
          ))}
          <Chip label="+ 17 more" onPress={() => router.push('/languages')} />
        </Wrap>
      </View>
      <View style={{ gap: 10 }}>
        <Caps>What brings you here? Pick any</Caps>
        {GOALS.map((g) => {
          const on = prefs.goals.includes(g);
          return (
            <Pressable
              key={g}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(g)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: on ? colors.saffronTint : colors.white, borderWidth: 1, borderColor: on ? colors.saffron : colors.line }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: on ? colors.saffron : '#B9B8C8', backgroundColor: on ? colors.saffron : colors.white, alignItems: 'center', justifyContent: 'center' }}>
                {on ? <Icon name="checkmark" size={16} color={colors.white} /> : null}
              </View>
              <Text style={type.label}>{g}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ gap: 10 }}>
        <Caps>Daily time</Caps>
        <Wrap>
          {([5, 10, 15] as const).map((m) => (
            <Chip key={m} label={`${m} min`} active={prefs.dailyMinutes === m} onPress={() => setPrefs({ dailyMinutes: m })} />
          ))}
        </Wrap>
      </View>
    </Screen>
  );
}
