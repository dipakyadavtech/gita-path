// K8 · Sticker book: every sticker, how to earn the missing ones, and sharing the garden with family.
import { useEffect, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { K, KidsButton, KidsCard, KidsScreen, kidsText } from '@/components/kids';
import { ProgressBar } from '@/components/ui';
import { stickers } from '@/lib/kids/content';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { colors, fonts, space } from '@/theme';

export default function StickerBook() {
  const { kid, progress } = useCurrentKid();
  const seen = useKids((s) => s.seenStickers);
  const [fresh] = useState(progress.newStickers);
  const [open, setOpen] = useState<string | null>(null);
  const owned = stickers.filter((s) => progress.stickers.includes(s.id));
  const pct = owned.length / stickers.length;

  useEffect(() => {
    if (progress.newStickers.length) seen();
  }, [progress.newStickers.length, seen]);

  if (!kid) return null;
  const share = () =>
    Share.share({ message: `${kid.name} has collected ${owned.length} of ${stickers.length} stickers in Gita Path Kids: ${owned.map((s) => s.emoji).join(' ')}` }).catch(() => {});

  return (
    <KidsScreen title="Sticker book" subtitle="Moru's Garden">
      <KidsCard>
        <Text style={kidsText.title}>{kid.name}’s Vrindavan garden</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <K>{owned.length} of {stickers.length} stickers</K>
          <K style={{ color: colors.teal, fontFamily: fonts.kids }}>{Math.round(pct * 100)}%</K>
        </View>
        <ProgressBar value={pct} color={colors.indigo} track="#EADFC8" height={12} />
      </KidsCard>

      <View style={{ height: 210, borderRadius: 32, backgroundColor: '#CFEFD0', padding: space.md, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 6 }}
        accessibilityLabel={`Garden with ${owned.length} stickers placed`}>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 34, height: 26, backgroundColor: '#8FD3F4' }} />
        {owned.length === 0 ? <K style={{ color: colors.leaf }}>Your garden is waiting for its first sticker 🌱</K> :
          owned.map((s) => <Text key={s.id} style={{ fontSize: 38 }}>{s.emoji}</Text>)}
      </View>

      <Text style={kidsText.title}>Sticker box</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {stickers.map((s) => {
          const has = progress.stickers.includes(s.id);
          const isNew = fresh.includes(s.id);
          return (
            <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={`${s.name}. ${has ? 'Collected' : `Locked. ${s.how}`}`} onPress={() => setOpen(open === s.id ? null : s.id)}
              style={{ width: '30%', flexGrow: 1, minHeight: 140, borderRadius: 26, padding: space.sm, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: has ? colors.white : '#EFE6D2', borderBottomWidth: 5, borderBottomColor: colors.kidsLine }}>
              {isNew ? <Text style={{ position: 'absolute', top: 8, left: 8, fontFamily: fonts.kids, fontSize: 12, color: colors.white, backgroundColor: colors.saffron, borderRadius: 10, paddingHorizontal: 6, overflow: 'hidden' }}>NEW</Text> : null}
              <Text style={{ fontSize: 40, opacity: has ? 1 : 0.35 }}>{has ? s.emoji : s.rule.allOthers ? '🎁' : '🔒'}</Text>
              <Text style={{ fontFamily: fonts.kids, fontSize: 15, color: colors.ink, textAlign: 'center' }} numberOfLines={2}>{s.rule.allOthers && !has ? 'Mystery gift' : s.name}</Text>
              {open === s.id || !has ? <Text style={{ fontFamily: fonts.kidsMedium, fontSize: 12, color: has ? colors.teal : colors.muted, textAlign: 'center' }} numberOfLines={3}>{has ? 'In your garden ✓' : s.how}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <KidsCard tone="sky">
        <Text style={kidsText.h2}>Show Mom & Dad my garden!</Text>
        <K style={{ fontSize: 15 }}>Sends a little message with your stickers. A grown-up chooses who gets it.</K>
        <KidsButton kind="indigo" icon="share-social" label="Share my garden" onPress={share} disabled={owned.length === 0} />
      </KidsCard>
    </KidsScreen>
  );
}
