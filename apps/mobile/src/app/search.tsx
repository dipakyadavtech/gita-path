import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Caps, Chip, Field, Icon, Screen, TopBar, Wrap } from '@/components/ui';
import { stories, topics, verseById, verses } from '@/lib/content';
import { colors, fonts, radius, type } from '@/theme';

// E6 · Search (verses, stories, topics; Sanskrit in Roman letters works through the IAST field)
type Filter = 'All' | 'Verses' | 'Stories' | 'Topics';
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Search() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const n = norm(q.trim());
  const results = useMemo(() => {
    if (!n) return { verses: [], stories: [], topics: [] };
    return {
      verses: verses.filter((v) => [v.id, v.meaning, v.lifeNote, v.iast, ...v.themes, ...v.sanskrit].some((f) => norm(f).includes(n))),
      stories: stories.filter((s) => !s.kids && norm(s.title).includes(n)),
      topics: topics.filter((t) => norm(t.title).includes(n) || t.id.includes(n) || t.moods.some((m) => norm(m).includes(n))),
    };
  }, [n]);
  const none = n && !results.verses.length && !results.stories.length && !results.topics.length;

  return (
    <Screen>
      <TopBar title="Search" />
      <Field label="Search verses, stories and topics" value={q} onChangeText={setQ} placeholder="Try anger, karma or 2.47" autoFocus />
      <Wrap>
        {(['All', 'Verses', 'Stories', 'Topics'] as Filter[]).map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </Wrap>
      {none ? (
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 30 }}>
          <Icon name="search" size={36} color={colors.muted} />
          <Text style={type.h3}>Nothing found for “{q}”</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>Try a feeling like “anger” or a verse number like 2.47.</Text>
        </View>
      ) : null}
      {(filter === 'All' || filter === 'Topics') &&
        results.topics.map((t) => (
          <Pressable key={t.id} onPress={() => router.push({ pathname: '/verse/[id]', params: { id: t.verses[0] } })} accessibilityRole="link" style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.saffronTint }}>
            <Caps color={colors.saffron}>Topic track</Caps>
            <Text style={type.label}>{t.title} · {t.verses.length} verses</Text>
          </Pressable>
        ))}
      {(filter === 'All' || filter === 'Verses') &&
        results.verses.map((v) => (
          <Pressable key={v.id} onPress={() => router.push({ pathname: '/verse/[id]', params: { id: v.id } })} accessibilityRole="link" style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 4 }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.saffron }}>VERSE {v.id}</Text>
            <Text style={{ fontFamily: fonts.verseBold, fontSize: 15, color: colors.ink }}>{v.sanskrit[0]}</Text>
            <Text style={type.small} numberOfLines={2}>{v.meaning}</Text>
          </Pressable>
        ))}
      {(filter === 'All' || filter === 'Stories') &&
        results.stories.map((s) => (
          <Pressable key={s.id} onPress={() => router.push({ pathname: '/story/[id]', params: { id: s.id } })} accessibilityRole="link" style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }}>
            <Caps>Story · Episode {s.episode}</Caps>
            <Text style={type.label}>{s.title}</Text>
          </Pressable>
        ))}
      {!n ? <Text style={type.small}>Search works in any app language, and in Sanskrit typed in Roman letters.</Text> : null}
      {verseById('2.47') ? null : null}
    </Screen>
  );
}
