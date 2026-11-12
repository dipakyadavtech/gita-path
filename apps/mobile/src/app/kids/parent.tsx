// K10 · Parent zone (behind the PIN): children, screen time, bedtime, chant gate, narration,
// what each child learned this week, and leaving Kids mode.
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { K, KidsButton, KidsCard, kidsText, RoundButton } from '@/components/kids';
import { Icon, ProgressBar, Screen } from '@/components/ui';
import { daysBetween, todayKey } from '@/lib/dates';
import { AVATAR_EMOJI, AVATARS, episodeFor, kidsStories, type AvatarId } from '@/lib/kids/content';
import { lockParent, parentUnlocked } from '@/lib/kids/gateSession';
import { emptyKidProgress, newKidId, useKids, type KidProfile, type KidsSettings } from '@/lib/kids/store';
import { deleteProfile, pushProfile, pushSettings } from '@/lib/kids/sync';
import { fmtClock } from '@/lib/kids/time';
import { colors, fonts, space } from '@/theme';

const LIMITS = [10, 15, 20, 30, 45, 60];
const BEDTIMES = ['19:30', '20:00', '20:30', '21:00'];
const NARRATION: { id: KidsSettings['narration']; label: string }[] = [
  { id: 'hi+en', label: 'Hindi + English captions' },
  { id: 'hi', label: 'Hindi only' },
  { id: 'en', label: 'English only' },
];

export default function ParentZone() {
  const { add } = useLocalSearchParams<{ add?: string }>();
  const s = useKids();
  const [editing, setEditing] = useState<KidProfile | null>(add ? { id: newKidId(), name: '', age: 6, avatar: 'moru' } : null);
  if (!parentUnlocked()) return <Redirect href={{ pathname: '/kids/gate', params: { next: '/kids/parent' } }} />;

  const set = (patch: Partial<KidsSettings>) => {
    s.setSettings(patch);
    pushSettings({ ...s.settings, ...patch });
  };
  const current = s.profiles.find((p) => p.id === s.currentId) ?? s.profiles[0];

  const leave = () => {
    s.setActive(false);
    lockParent();
    router.replace('/(tabs)');
  };
  const backToKids = () => {
    lockParent();
    router.replace(s.profiles.length > 1 ? '/kids' : '/kids/home');
  };

  return (
    <Screen bg={colors.kidsCanvas}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <RoundButton icon="arrow-back" label="Back to Kids mode" onPress={() => (s.profiles.length ? backToKids() : router.replace('/kids'))} />
        <View style={{ flex: 1 }}>
          <Text style={kidsText.h2}>Parent zone</Text>
          <Text style={[kidsText.small, { color: colors.teal }]}>Protected by your PIN</Text>
        </View>
      </View>

      {/* Children */}
      <KidsCard>
        <Text style={kidsText.h2}>Children</Text>
        {s.profiles.length === 0 && !editing ? <K style={{ color: colors.muted }}>Add your first child to start.</K> : null}
        {s.profiles.map((p) => {
          const pr = s.progress[p.id] ?? emptyKidProgress();
          const on = p.id === current?.id;
          return (
            <Pressable key={p.id} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${p.name}, age ${p.age}`} onPress={() => s.select(p.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: 22, backgroundColor: on ? '#F3EAD6' : colors.white, borderWidth: 1, borderColor: colors.kidsLine }}>
              <Text style={{ fontSize: 34 }}>{AVATAR_EMOJI[p.avatar]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={kidsText.h2}>{p.name} <Text style={kidsText.small}>· age {p.age}</Text></Text>
                <K style={{ fontSize: 14, color: colors.muted }}>⭐ {pr.stars} stars · {pr.stickers.length} stickers</K>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${p.name}`} onPress={() => setEditing(p)} hitSlop={8} style={{ padding: 6 }}>
                <Icon name="create-outline" size={22} color={colors.indigo} />
              </Pressable>
              {on ? <Icon name="checkmark-circle" size={24} color={colors.teal} /> : null}
            </Pressable>
          );
        })}
        {editing ? (
          <ChildForm
            value={editing}
            isNew={!s.profiles.some((p) => p.id === editing.id)}
            onCancel={() => setEditing(null)}
            onSave={(p) => {
              s.saveProfile(p);
              pushProfile(p);
              setEditing(null);
            }}
            onRemove={() => {
              s.removeProfile(editing.id);
              deleteProfile(editing.id);
              setEditing(null);
            }}
          />
        ) : s.profiles.length < 4 ? (
          <KidsButton small kind="cream" icon="add" label="Add a child" onPress={() => setEditing({ id: newKidId(), name: '', age: 6, avatar: 'moru' })} />
        ) : (
          <K style={{ fontSize: 14, color: colors.muted }}>Up to 4 children per family.</K>
        )}
      </KidsCard>

      {current ? (
        <>
          <ScreenTime kidId={current.id} name={current.name} set={set} />
          <Insights kidId={current.id} name={current.name} />
        </>
      ) : null}

      {/* Bedtime + chant gate */}
      <KidsCard>
        <Text style={kidsText.h2}>Healthy habits</Text>
        <ToggleRow icon="moon-outline" title="Bedtime lock" sub={`No Kids mode from ${fmtClock(s.settings.bedtimeStart)} to ${fmtClock(s.settings.bedtimeEnd)}`}
          value={s.settings.bedtimeOn} onChange={(v) => set({ bedtimeOn: v })} />
        {s.settings.bedtimeOn ? (
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {BEDTIMES.map((b) => <Choice key={b} label={fmtClock(b)} on={s.settings.bedtimeStart === b} onPress={() => set({ bedtimeStart: b })} />)}
          </View>
        ) : null}
        <ToggleRow icon="musical-notes-outline" title="Shloka before stories" sub="Your child sings today’s shloka before stories unlock"
          value={s.settings.chantGate} onChange={(v) => set({ chantGate: v })} />
      </KidsCard>

      {/* Narration */}
      <KidsCard>
        <Text style={kidsText.h2}>Story language</Text>
        {NARRATION.map((n) => (
          <Pressable key={n.id} accessibilityRole="radio" accessibilityState={{ checked: s.settings.narration === n.id }} onPress={() => set({ narration: n.id })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 }}>
            <Icon name={s.settings.narration === n.id ? 'radio-button-on' : 'radio-button-off'} size={24} color={colors.indigo} />
            <K>{n.label}</K>
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: '#F3EAD6', borderRadius: 18, padding: space.md }}>
          <Icon name="ban-outline" size={22} color={colors.danger} />
          <K style={{ flex: 1, fontSize: 15 }}>Autoplay is always off. Stories stop at the end and never play one after another.</K>
        </View>
      </KidsCard>

      <KidsCard tone="sky">
        <Text style={kidsText.h2}>Our promise</Text>
        <K style={{ fontSize: 15 }}>No ads. No chat with strangers. No links out of the app. No in-app purchases inside Kids mode. Children never sign in — your account owns their profiles.</K>
        <KidsButton small kind="cream" icon="key-outline" label="Change parent PIN" onPress={() => router.push({ pathname: '/kids/gate', params: { mode: 'create', next: '/kids/parent' } })} />
      </KidsCard>

      {s.profiles.length ? <KidsButton icon="happy-outline" label="Back to Kids mode" onPress={backToKids} /> : null}
      <KidsButton kind="cream" icon="exit-outline" label="Leave Kids mode" onPress={leave} />
    </Screen>
  );
}

function ScreenTime({ kidId, name, set }: { kidId: string; name: string; set: (p: Partial<KidsSettings>) => void }) {
  const settings = useKids((s) => s.settings);
  const usage = useKids((s) => s.usage[kidId]);
  const extra = useKids((s) => s.extra);
  const grant = useKids((s) => s.grantExtra);
  const today = todayKey();
  const used = usage && usage.date === today ? Math.round(usage.seconds / 60) : 0;
  const bonus = extra && extra.date === today ? extra.minutes : 0;
  const limit = settings.dailyLimitMin + bonus;
  return (
    <KidsCard>
      <Text style={kidsText.h2}>Screen time</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <K>{name} today</K>
        <K style={{ fontFamily: fonts.kids, color: colors.indigo }}>{used} / {limit} min</K>
      </View>
      <ProgressBar value={Math.min(1, used / limit)} color={colors.indigo} track="#EADFC8" height={12} />
      <Text style={kidsText.small}>Daily limit</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {LIMITS.map((m) => <Choice key={m} label={`${m}m`} on={settings.dailyLimitMin === m} onPress={() => set({ dailyLimitMin: m })} />)}
      </View>
      <KidsButton small kind="cream" icon="add-circle-outline" label="Give 10 more minutes today" onPress={() => grant(10)} />
    </KidsCard>
  );
}

function Insights({ kidId, name }: { kidId: string; name: string }) {
  const p = useKids((s) => s.progress[kidId]) ?? emptyKidProgress();
  const today = todayKey();
  const inWeek = (d: string) => d !== 'synced' && daysBetween(d, today) < 7;
  const stories = Object.entries(p.stories).filter(([, d]) => inWeek(d)).map(([id]) => id);
  const shlokas = Object.values(p.shlokas).filter(inWeek).length;
  const activeDays = Object.keys(p.days).filter(inWeek).length;
  const latest = stories.length ? stories[stories.length - 1] : Object.keys(p.stories).pop();
  const ep = latest ? episodeFor(latest) : undefined;
  const title = latest ? kidsStories.find((s) => s.id === latest)?.title : undefined;
  return (
    <KidsCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={kidsText.h2}>What {name} learned</Text>
        <Text style={[kidsText.caps, { color: colors.saffron }]}>This week</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {[[stories.length, 'stories'], [shlokas, 'shlokas'], [activeDays, 'days active']].map(([n, l]) => (
          <View key={l} style={{ flex: 1, backgroundColor: '#F3EAD6', borderRadius: 18, padding: space.sm, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: 24, color: colors.indigo }}>{n}</Text>
            <Text style={kidsText.small}>{l}</Text>
          </View>
        ))}
      </View>
      {ep && title ? (
        <KidsCard tone="sky">
          <Text style={[kidsText.small, { fontFamily: fonts.kids, color: colors.teal }]}>Family dinner question · from “{title}”</Text>
          <K>{ep.talkAbout}</K>
          <K style={{ fontSize: 14, color: colors.muted }}>Lesson: {ep.moral}</K>
        </KidsCard>
      ) : (
        <K style={{ color: colors.muted, fontSize: 15 }}>After {name} watches a story, you’ll see a question to talk about together here.</K>
      )}
    </KidsCard>
  );
}

function ChildForm({ value, isNew, onSave, onCancel, onRemove }: {
  value: KidProfile; isNew: boolean; onSave: (p: KidProfile) => void; onCancel: () => void; onRemove: () => void;
}) {
  const [p, setP] = useState(value);
  const [confirm, setConfirm] = useState(false);
  const valid = p.name.trim().length > 0;
  return (
    <View style={{ gap: space.md, backgroundColor: '#FFFBF1', borderRadius: 22, padding: space.md, borderWidth: 1, borderColor: colors.kidsLine }}>
      <Text style={kidsText.h2}>{isNew ? 'Add a child' : `Edit ${value.name}`}</Text>
      <Text style={kidsText.small}>First name or nickname</Text>
      <TextInput value={p.name} onChangeText={(name) => setP({ ...p, name: name.slice(0, 20) })} placeholder="e.g. Aarav" accessibilityLabel="Child's name"
        style={{ fontFamily: fonts.kidsMedium, fontSize: 18, backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: space.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.kidsLine }} />
      <Text style={kidsText.small}>Age</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <RoundButton icon="remove" label="Younger" onPress={() => setP({ ...p, age: Math.max(3, p.age - 1) })} />
        <Text style={[kidsText.title, { minWidth: 40, textAlign: 'center' }]} accessibilityLabel={`Age ${p.age}`}>{p.age}</Text>
        <RoundButton icon="add" label="Older" onPress={() => setP({ ...p, age: Math.min(12, p.age + 1) })} />
        <K style={{ color: colors.muted, fontSize: 14 }}>3–12 years</K>
      </View>
      <Text style={kidsText.small}>Buddy picture</Text>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {AVATARS.map((a: AvatarId) => (
          <Pressable key={a} accessibilityRole="radio" accessibilityState={{ checked: p.avatar === a }} accessibilityLabel={a} onPress={() => setP({ ...p, avatar: a })}
            style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: p.avatar === a ? colors.indigo : '#F3EAD6' }}>
            <Text style={{ fontSize: 28 }}>{AVATAR_EMOJI[a]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}><KidsButton small kind="cream" label="Cancel" onPress={onCancel} /></View>
        <View style={{ flex: 1 }}><KidsButton small label="Save" disabled={!valid} onPress={() => onSave({ ...p, name: p.name.trim() })} /></View>
      </View>
      {!isNew ? (
        confirm ? (
          <View style={{ gap: space.sm }}>
            <K style={{ color: colors.danger, fontSize: 15 }}>Remove {value.name} and all their stars and stickers? This can’t be undone.</K>
            <KidsButton small kind="saffron" label={`Yes, remove ${value.name}`} onPress={onRemove} />
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setConfirm(true)} style={{ alignSelf: 'center', padding: space.sm }}>
            <Text style={{ fontFamily: fonts.kids, color: colors.danger, textDecorationLine: 'underline' }}>Remove this child</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

function ToggleRow({ icon, title, sub, value, onChange }: { icon: 'moon-outline' | 'musical-notes-outline'; title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Icon name={icon} size={24} color={colors.teal} />
      <View style={{ flex: 1 }}>
        <Text style={[kidsText.body, { fontFamily: fonts.kids }]}>{title}</Text>
        <K style={{ fontSize: 14, color: colors.muted }}>{sub}</K>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={title} trackColor={{ true: colors.teal, false: '#D9D2C2' }} thumbColor={colors.white} />
    </View>
  );
}

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress}
      style={{ minWidth: 64, minHeight: 44, paddingHorizontal: 12, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.indigo : '#F3EAD6', flexGrow: 1 }}>
      <Text style={{ fontFamily: fonts.kids, fontSize: 15, color: on ? colors.white : colors.indigo }}>{label}</Text>
    </Pressable>
  );
}
