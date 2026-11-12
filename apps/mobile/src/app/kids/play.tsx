// K7 · Word match game: tap a Sanskrit word, then its meaning. No timer, no losing.
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Buddy, K, KidsButton, KidsCard, KidsScreen, kidsText, StarPill } from '@/components/kids';
import { Icon } from '@/components/ui';
import { todayKey } from '@/lib/dates';
import { gameWordsFor, REWARDS, stickers } from '@/lib/kids/content';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { pushProgress } from '@/lib/kids/sync';
import { colors, fonts, space } from '@/theme';

export default function WordGame() {
  const { kid, progress } = useCurrentKid();
  const award = useKids((s) => s.award);
  const currentId = useKids((s) => s.currentId);
  const [round, setRound] = useState(0);
  const words = useMemo(() => gameWordsFor(todayKey(), round), [round]);
  // Meanings shown in a different order from the words.
  const meanings = useMemo(() => [2, 0, 3, 1].map((i) => words[i]), [words]);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [message, setMessage] = useState('Tap a word on the left, then its meaning on the right.');
  const [hintFor, setHintFor] = useState<string | null>(null);
  const [result, setResult] = useState<{ gained: number; stars: number; newStickers: string[] } | null>(null);

  const allDone = matched.length === words.length;

  const tapMeaning = (id: string) => {
    if (!picked || matched.includes(id)) return;
    const w = words.find((x) => x.id === picked)!;
    if (picked === id) {
      setMatched((m) => [...m, id]);
      setMessage(`Wah, ${kid?.name}! “${w.word}” means ${w.meaning.toLowerCase()}.`);
      setHintFor(null);
    } else {
      setMessage(`Not that one — try another meaning for “${w.word}”.`);
    }
    setPicked(null);
  };

  const claim = () => {
    const r = award('game', `words-${todayKey()}-${round}`);
    if (currentId) pushProgress(currentId, 'game', `words-${todayKey()}-${round}`, r.gained);
    setResult(r);
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setMatched([]);
    setPicked(null);
    setResult(null);
    setMessage('New words! Tap a word, then its meaning.');
  };

  const hint = () => {
    const w = words.find((x) => !matched.includes(x.id));
    if (!w) return;
    setPicked(w.id);
    setHintFor(w.id);
    setMessage(`Hint: “${w.word}” goes with the ${w.emoji} picture.`);
  };

  const sticker = result?.newStickers.map((s) => stickers.find((x) => x.id === s)).find(Boolean);

  return (
    <KidsScreen title="Word game" subtitle="Moru's Garden">
      <KidsCard tone="sky">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={kidsText.caps}>Find the meanings</Text>
          <StarPill stars={matched.length} label={`${matched.length}/${words.length}`} />
        </View>
        <Text style={kidsText.title}>Help Krishna find his words! 🏺</Text>
        <Buddy>{message}</Buddy>
      </KidsCard>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1, gap: space.md }}>
          <Text style={[kidsText.h2, { fontSize: 17 }]}>Sanskrit words</Text>
          {words.map((w) => {
            const done = matched.includes(w.id);
            const sel = picked === w.id;
            return (
              <Pressable key={w.id} accessibilityRole="button" accessibilityState={{ selected: sel, disabled: done }} accessibilityLabel={`${w.word}${done ? ', matched' : ''}`}
                disabled={done} onPress={() => { setPicked(w.id); setMessage(`Now tap what “${w.word}” means.`); }}
                style={{ minHeight: 92, borderRadius: 24, padding: space.md, justifyContent: 'center', backgroundColor: done ? '#D8F1EE' : colors.white, borderWidth: 3, borderColor: sel ? colors.indigo : 'transparent', borderBottomWidth: 5, borderBottomColor: sel ? colors.indigo : colors.kidsLine }}>
                <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: 21, color: colors.indigo }}>{w.word}</Text>
                <Text style={{ fontFamily: fonts.verse, fontSize: 16, color: colors.muted }}>{w.sanskrit}</Text>
                {done ? <View style={{ position: 'absolute', right: 10, top: 10 }}><Icon name="checkmark-circle" size={24} color={colors.teal} /></View> : null}
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1, gap: space.md }}>
          <Text style={[kidsText.h2, { fontSize: 17, color: colors.teal }]}>What it means</Text>
          {meanings.map((m) => {
            const done = matched.includes(m.id);
            const glow = hintFor === m.id;
            return (
              <Pressable key={m.id} accessibilityRole="button" accessibilityState={{ disabled: done || !picked }} accessibilityLabel={`${m.meaning}${done ? ', matched' : ''}`}
                disabled={done} onPress={() => tapMeaning(m.id)}
                style={{ minHeight: 92, borderRadius: 24, padding: space.md, justifyContent: 'center', gap: 4, backgroundColor: done ? '#D8F1EE' : picked ? '#EEEDF8' : colors.white, borderWidth: glow ? 3 : 0, borderColor: colors.gold, borderBottomWidth: 5, borderBottomColor: colors.kidsLine }}>
                <Text style={{ fontFamily: fonts.kidsMedium, fontSize: 15, lineHeight: 19, color: colors.ink }}>{m.meaning}</Text>
                <Text style={{ fontSize: 20 }}>{m.emoji}{done ? '  ✓' : ''}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {result ? (
        <KidsCard tone="sun" style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 52 }}>🏆</Text>
          <Text style={kidsText.title}>Super match!</Text>
          <StarPill stars={result.stars} label={`+${result.gained} stars`} />
          {sticker ? <K>New sticker: {sticker.emoji} {sticker.name}</K> : null}
          <KidsButton kind="indigo" icon="refresh" label="Play new words" onPress={nextRound} />
        </KidsCard>
      ) : (
        <View style={{ gap: space.md }}>
          <KidsButton kind="indigo" icon="star" label={`Claim my ${REWARDS.game} stars!`} disabled={!allDone} onPress={claim} />
          {!allDone ? <KidsButton kind="cream" icon="bulb-outline" label="Give me a friendly hint" onPress={hint} /> : null}
        </View>
      )}
      <K style={{ textAlign: 'center', color: colors.muted, fontSize: 14 }}>No rush — there’s no timer. {progress.games} games won so far.</K>
    </KidsScreen>
  );
}
