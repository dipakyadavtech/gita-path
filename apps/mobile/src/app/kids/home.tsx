// K3 · Kids home: greeting, today's story, three magic steps, sticker preview.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Buddy, K, KidsButton, KidsCard, KidsScreen, kidsText, StarPill } from '@/components/kids';
import { Icon } from '@/components/ui';
import { stickers } from '@/lib/kids/content';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { fmtClock, secondsLeft } from '@/lib/kids/time';
import { todaysSteps, type Step } from '@/lib/kids/today';
import { colors, fonts, space } from '@/theme';

const STEP_ICON = { watch: 'play', sing: 'mic', play: 'game-controller' } as const;

export default function KidsHome() {
  const { kid, progress } = useCurrentKid();
  const settings = useKids((s) => s.settings);
  const usage = useKids((s) => (s.currentId ? s.usage[s.currentId] : undefined));
  const extra = useKids((s) => s.extra);
  if (!kid) return null;

  const { story, shloka, steps, doneCount } = todaysSteps(progress, settings.chantGate);
  const routeFor = { watch: `/kids/watch/${story.id}`, sing: `/kids/sing/${shloka.id}`, play: '/kids/play' } as const;
  const owned = stickers.filter((s) => progress.stickers.includes(s.id));
  const next = steps.find((s) => !s.done);
  const minsLeft = Math.ceil(secondsLeft(settings, usage, extra) / 60);

  return (
    <KidsScreen title="Kids Home" subtitle="Moru's Garden">
      <KidsCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={kidsText.hero}>Namaste, {kid.name}!</Text>
            <View style={{ alignSelf: 'flex-start' }}><StarPill stars={progress.stars} label={`${progress.stars} stars`} /></View>
          </View>
          <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: '#DDEFFF', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 52 }} accessibilityLabel="Moru the peacock">🦚</Text>
          </View>
        </View>
        <Buddy>
          {doneCount === 3
            ? 'You finished all three magic steps today! Krishna would be proud.'
            : next
              ? `Ready? Next magic step: ${next.title.toLowerCase()}!`
              : 'Ready for today’s quest?'}
        </Buddy>
      </KidsCard>

      <KidsCard>
        <View style={{ height: 150, borderRadius: 22, backgroundColor: '#FFE3B3', alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
          <Text style={{ fontSize: 64 }}>{story.id === 'k2' ? '⛰️' : story.id === 'k3' ? '🌊' : '🏺'}</Text>
        </View>
        <Text style={kidsText.caps}>Episode {story.episode} · {story.minutes} min story</Text>
        <Text style={kidsText.title}>{story.title}</Text>
        <KidsButton kind="brown" icon="play" label={`Watch the story (${story.minutes} min)`} onPress={() => router.push(`/kids/watch/${story.id}`)} />
      </KidsCard>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={kidsText.title}>Today’s 3 magic steps</Text>
        <Text style={[kidsText.small, { color: colors.teal, fontFamily: fonts.kids }]}>{doneCount} of 3 done</Text>
      </View>
      {steps.map((s, i) => <StepRow key={s.id} step={s} n={i + 1} onOpen={() => router.push(routeFor[s.id])} />)}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={kidsText.title}>{kid.name}’s sticker book</Text>
        <KidsButton small kind="cream" label="Open book" onPress={() => router.push('/kids/stickers')} />
      </View>
      <K style={{ color: colors.muted }}>{owned.length} of {stickers.length} stickers collected{progress.newStickers.length ? ` · ${progress.newStickers.length} new!` : ''}</K>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {(owned.length ? owned.slice(-3) : stickers.slice(0, 3)).map((s) => (
          <KidsCard key={s.id} style={{ flex: 1, alignItems: 'center', padding: space.md, opacity: owned.length ? 1 : 0.45 }}>
            <Text style={{ fontSize: 34 }}>{owned.length ? s.emoji : '❔'}</Text>
            <Text style={[kidsText.small, { textAlign: 'center', fontFamily: fonts.kids, color: colors.ink }]} numberOfLines={2}>{owned.length ? s.name : 'Not yet'}</Text>
          </KidsCard>
        ))}
      </View>

      <KidsCard tone="cream" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="hourglass-outline" size={22} color={colors.teal} />
        <K style={{ flex: 1 }}>{minsLeft} min screen time left today</K>
        {settings.bedtimeOn ? <K style={{ color: colors.muted, fontSize: 15 }}>🌙 {fmtClock(settings.bedtimeStart)}</K> : null}
      </KidsCard>

      {Object.keys(progress.stories).length >= 2 && Object.keys(progress.shlokas).length >= 2 ? (
        <KidsButton kind="teal" icon="ribbon" label="See my certificate" onPress={() => router.push('/kids/certificate')} />
      ) : null}
    </KidsScreen>
  );
}

function StepRow({ step, n, onOpen }: { step: Step; n: number; onOpen: () => void }) {
  const current = step.open && !step.done;
  return (
    <KidsCard tone={step.done ? 'cream' : 'white'} style={[{ flexDirection: 'row', alignItems: 'center' }, current && { borderWidth: 3, borderColor: colors.indigo }, !step.open && { opacity: 0.6 }]}
      onPress={step.open ? onOpen : undefined}
      label={`Step ${n}: ${step.title}. ${step.done ? 'Done' : step.open ? 'Ready' : 'Locked'}`}>
      <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: step.done ? colors.teal : current ? colors.indigo : '#E8DFC9' }}>
        <Icon name={step.done ? 'checkmark' : step.open ? STEP_ICON[step.id] : 'lock-closed'} size={26} color={step.done || current ? colors.white : colors.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[kidsText.h2, step.done && { color: colors.teal }]}>{n}. {step.title}</Text>
        <K style={{ fontSize: 15, color: colors.muted }} numberOfLines={2}>{step.detail}</K>
      </View>
      <Text style={{ fontFamily: fonts.kids, fontSize: 13, color: step.done ? colors.teal : current ? colors.saffron : colors.muted }}>
        {step.done ? 'DONE ✓' : current ? 'GO!' : 'NEXT'}
      </Text>
    </KidsCard>
  );
}
