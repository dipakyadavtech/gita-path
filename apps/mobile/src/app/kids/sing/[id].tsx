// K6 · Sing a shloka: Moru sings first (words light up), then the child sings along.
// Studio audio is not recorded yet, so the timing is simulated per word (see usePlayer).
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Buddy, K, KidsButton, KidsCard, KidsScreen, kidsText, StarPill } from '@/components/kids';
import { CHARACTERS, kidsShlokas, shlokaById, stickers } from '@/lib/kids/content';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { pushProgress } from '@/lib/kids/sync';
import { usePlayer } from '@/lib/usePlayer';
import { colors, fonts, space } from '@/theme';

const SPEEDS = { slow: { label: '🐢 Slow', perWord: 1.6 }, moru: { label: '🦚 Moru pace', perWord: 1.1 }, flow: { label: '🎶 Flow', perWord: 0.8 } } as const;
type Speed = keyof typeof SPEEDS;

export default function SingShloka() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shloka = shlokaById(id) ?? kidsShlokas[0];
  const buddy = CHARACTERS[shloka.character];
  const { kid, progress } = useCurrentKid();
  const award = useKids((s) => s.award);
  const currentId = useKids((s) => s.currentId);
  const [speed, setSpeed] = useState<Speed>('moru');
  const [mode, setMode] = useState<'listen' | 'sing'>('listen');
  const [heard, setHeard] = useState(false);
  const [result, setResult] = useState<{ gained: number; stars: number; newStickers: string[] } | null>(null);

  const finish = () => {
    const r = award('shloka', shloka.id);
    if (currentId) pushProgress(currentId, 'shloka', shloka.id, r.gained);
    setResult(r);
  };

  const words = shloka.lines.flatMap((l, li) => l.words.map((w) => ({ ...w, line: li })));
  const perWord = SPEEDS[speed].perWord;
  const total = words.length * perWord;
  const player = usePlayer(total, 1, () => {
    if (mode === 'listen') setHeard(true);
    else finish();
  });
  const idx = player.playing || player.position > 0 ? Math.min(words.length - 1, Math.floor(player.position / perWord)) : -1;
  const line = idx >= 0 ? words[idx].line : 0;

  const start = (m: 'listen' | 'sing') => {
    setMode(m);
    player.seek(0);
    if (!player.playing) player.toggle();
  };

  const nextSticker = stickers.find((s) => s.rule.shloka === shloka.id && !progress.stickers.includes(s.id));
  const sticker = result?.newStickers.map((s) => stickers.find((x) => x.id === s)).find(Boolean);

  return (
    <KidsScreen title="Sing shloka" subtitle={`Gita ${shloka.verseId}`} onBack={() => router.back()}>
      <KidsCard style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: buddy.tint, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 34 }}>{buddy.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={kidsText.h2}>Sing with {buddy.name}!</Text>
          <K style={{ fontSize: 15, color: colors.muted }}>{shloka.title} · line {line + 1} of {shloka.lines.length}</K>
        </View>
        <StarPill stars={15} label="+15" />
      </KidsCard>

      <KidsCard>
        <Text style={[kidsText.caps, { alignSelf: 'center', color: player.playing ? colors.saffron : colors.teal }]}>
          {player.playing ? (mode === 'listen' ? `${buddy.name} is singing…` : 'Your turn — sing!') : 'Tap a button to start'}
        </Text>
        {shloka.lines.map((l, li) => (
          <View key={li} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: space.md, borderRadius: 22, backgroundColor: li === line ? '#F3EAD6' : 'transparent' }}
            accessibilityLabel={l.sanskrit}>
            {l.words.map((w, wi) => {
              const gi = shloka.lines.slice(0, li).reduce((n, x) => n + x.words.length, 0) + wi;
              const on = gi === idx;
              return (
                <View key={wi} style={{ alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: on ? colors.teal : gi < idx ? '#E2F1F1' : colors.white }}>
                  <Text style={{ fontFamily: fonts.verseBold, fontSize: on ? 26 : 22, color: on ? colors.white : colors.indigo }}>{w.dev}</Text>
                  <Text style={{ fontFamily: fonts.kidsMedium, fontSize: 13, color: on ? '#D7F5F5' : colors.muted }}>{w.iast}</Text>
                </View>
              );
            })}
          </View>
        ))}
        <KidsCard tone="sky" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 26 }}>💬</Text>
          <K style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.kidsHeavy, color: colors.teal }}>{buddy.name}’s pocket meaning: </Text>
            <Text style={{ fontFamily: fonts.kidsHeavy, color: colors.indigo }}>{shloka.pocketWord.word}</Text> = {shloka.pocketWord.meaning}
          </K>
        </KidsCard>
        <K style={{ textAlign: 'center' }}>{shloka.simpleMeaning}</K>
      </KidsCard>

      <KidsCard>
        <Text style={kidsText.small}>Singing speed</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {(Object.keys(SPEEDS) as Speed[]).map((s) => (
            <Pressable key={s} accessibilityRole="radio" accessibilityState={{ checked: speed === s }} onPress={() => !player.playing && setSpeed(s)}
              style={{ flex: 1, minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: speed === s ? colors.indigo : '#F3EAD6' }}>
              <Text style={{ fontFamily: fonts.kids, fontSize: 15, color: speed === s ? colors.white : colors.indigo }}>{SPEEDS[s].label}</Text>
            </Pressable>
          ))}
        </View>
        {result ? (
          <View style={{ alignItems: 'center', gap: space.sm }}>
            <Text style={{ fontSize: 56 }}>🌟</Text>
            <Text style={[kidsText.title, { textAlign: 'center' }]}>Beautiful singing, {kid?.name}!</Text>
            <StarPill stars={result.stars} label={`+${result.gained} stars`} />
            {sticker ? <K>New sticker: {sticker.emoji} {sticker.name}</K> : null}
            <KidsButton kind="indigo" icon="home" label="Back to the garden" onPress={() => router.dismissTo('/kids/home')} />
            <KidsButton kind="cream" icon="refresh" label="Sing again" onPress={() => { setResult(null); start('sing'); }} />
          </View>
        ) : (
          <View style={{ gap: space.md }}>
            <KidsButton kind="teal" icon="volume-high" label={player.playing && mode === 'listen' ? 'Pause' : `Hear ${buddy.name}`}
              onPress={() => (player.playing && mode === 'listen' ? player.toggle() : start('listen'))} />
            <KidsButton kind="indigo" icon="mic" label={player.playing && mode === 'sing' ? 'Pause' : 'Now I sing!'} disabled={!heard && !progress.shlokas[shloka.id]}
              onPress={() => (player.playing && mode === 'sing' ? player.toggle() : start('sing'))} />
            {!heard && !progress.shlokas[shloka.id] ? <K style={{ textAlign: 'center', color: colors.muted, fontSize: 15 }}>Listen to {buddy.name} once, then it’s your turn.</K> : null}
          </View>
        )}
      </KidsCard>

      {nextSticker && !result ? <Buddy emoji={buddy.emoji} name={buddy.name} tint={buddy.tint}>Sing it and you get the {nextSticker.emoji} {nextSticker.name} sticker!</Buddy> : null}
    </KidsScreen>
  );
}
