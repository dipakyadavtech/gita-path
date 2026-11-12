// K6 list · The kids shlokas, today's first.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { K, KidsCard, KidsScreen, kidsText } from '@/components/kids';
import { todayKey } from '@/lib/dates';
import { CHARACTERS, kidsShlokas, shlokaOfTheDay } from '@/lib/kids/content';
import { useCurrentKid } from '@/lib/kids/store';
import { colors, fonts } from '@/theme';

export default function SingList() {
  const { progress } = useCurrentKid();
  const today = shlokaOfTheDay(todayKey());
  const list = [today, ...kidsShlokas.filter((s) => s.id !== today.id)];
  return (
    <KidsScreen title="Sing" subtitle="Shlokas with Moru">
      {list.map((s) => {
        const c = CHARACTERS[s.character];
        const sung = !!progress.shlokas[s.id];
        return (
          <KidsCard key={s.id} onPress={() => router.push(`/kids/sing/${s.id}`)} label={`${s.title}, Gita ${s.verseId}${sung ? ', sung' : ''}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 38 }}>{c.emoji}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              {s.id === today.id ? <Text style={[kidsText.caps, { color: colors.saffron }]}>Today’s shloka</Text> : null}
              <Text style={kidsText.h2}>{s.title}</Text>
              <K style={{ fontSize: 15, color: colors.muted }}>Gita {s.verseId} · with {c.name}</K>
            </View>
            <Text style={{ fontFamily: fonts.kids, fontSize: 14, color: sung ? colors.teal : colors.indigo }}>{sung ? 'SUNG ✓' : 'SING'}</Text>
          </KidsCard>
        );
      })}
    </KidsScreen>
  );
}
