import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Caps, Icon, Row, Screen } from '@/components/ui';
import { stories } from '@/lib/content';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// E4 · Stories
export default function Stories() {
  const watched = useApp((s) => s.watched);
  const season = stories.filter((s) => !s.kids).sort((a, b) => a.episode - b.episode);
  const featured = season.find((s) => !watched[s.id]) ?? season[0];
  const unlockedUntil = Math.max(...season.filter((s) => watched[s.id]).map((s) => s.episode), featured.episode);

  return (
    <Screen>
      <Text style={type.h1}>Stories</Text>
      <Pressable onPress={() => router.push({ pathname: '/story/[id]', params: { id: featured.id } })} accessibilityRole="button" accessibilityLabel={`Play ${featured.title}`} style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.indigo }}>
        <View style={{ height: 170, backgroundColor: '#2E2A6E', overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: -30, bottom: -40, width: 200, height: 120, borderRadius: 100, backgroundColor: colors.indigoSoft }} />
          <View style={{ position: 'absolute', right: -20, bottom: -50, width: 240, height: 130, borderRadius: 120, backgroundColor: '#433E92' }} />
          <View style={{ position: 'absolute', right: 56, top: 28, width: 46, height: 46, borderRadius: 23, backgroundColor: colors.goldSoft }} />
          <View style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -28, marginTop: -28, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" color={colors.white} size={24} />
          </View>
        </View>
        <View style={{ padding: 16, gap: 4 }}>
          <Caps color={colors.indigoText}>{`Mahabharata in 3 minutes · Episode ${featured.episode}`}</Caps>
          <Text style={[type.h3, { color: colors.white, fontSize: 18 }]}>{featured.title}</Text>
          {featured.summary ? <Text style={[type.small, { color: '#E2E0F8' }]}>{featured.summary}</Text> : null}
        </View>
      </Pressable>
      <Text style={type.h3}>Season 1 · Road to Kurukshetra</Text>
      {season.map((s) => {
        const done = !!watched[s.id];
        const locked = s.episode > unlockedUntil;
        const now = s.id === featured.id;
        return (
          <Pressable
            key={s.id}
            disabled={locked}
            onPress={() => router.push({ pathname: '/story/[id]', params: { id: s.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Episode ${s.episode}, ${s.title}${locked ? ', locked' : ''}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: now ? colors.saffronTint : colors.white, borderWidth: 1, borderColor: now ? colors.saffron : colors.line }}
          >
            <View style={{ width: 56, height: 42, borderRadius: 10, backgroundColor: locked ? '#D9D8E6' : colors.indigo, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={locked ? 'lock-closed' : 'play'} size={16} color={locked ? colors.muted : colors.indigoText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.small}>Episode {s.episode} · {s.minutes} min</Text>
              <Text style={[type.label]}>{s.title}</Text>
            </View>
            {done ? <Icon name="checkmark" color={colors.teal} /> : now ? <Icon name="play-circle" color={colors.saffron} /> : null}
          </Pressable>
        );
      })}
      <Row gap={8}>
        <Icon name="information-circle-outline" color={colors.muted} size={16} />
        <Text style={[type.small, { flex: 1 }]}>A new episode unlocks after you finish the previous one.</Text>
      </Row>
      <Text style={[type.small, { fontFamily: fonts.body }]}> </Text>
    </Screen>
  );
}
