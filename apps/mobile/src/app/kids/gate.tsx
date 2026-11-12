// K2 · Parent gate. mode=create sets the PIN (enter + confirm); otherwise checks it.
// "Grown-up check" (a times-table question) is offered as an alternative for verifying.
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { K, KidsButton, KidsCard, kidsText, RoundButton } from '@/components/kids';
import { Screen } from '@/components/ui';
import { unlockParent } from '@/lib/kids/gateSession';
import { useKids } from '@/lib/kids/store';
import { colors, fonts, space } from '@/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'] as const;

export default function ParentGate() {
  const { mode = 'verify', next = '/kids/parent' } = useLocalSearchParams<{ mode?: 'create' | 'verify'; next?: string }>();
  const creating = mode === 'create';
  const setPin = useKids((s) => s.setPin);
  const checkPin = useKids((s) => s.checkPin);
  const [tab, setTab] = useState<'pin' | 'math'>('pin');
  const [pin, setPinText] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fails, setFails] = useState(0);
  const [question] = useState(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }));
  const [answer, setAnswer] = useState('');

  const pass = () => {
    unlockParent();
    router.replace(next as Href);
  };

  const press = (k: (typeof KEYS)[number]) => {
    setError('');
    if (k === 'clear') return setPinText('');
    if (k === 'del') return setPinText((p) => p.slice(0, -1));
    const p = pin + k;
    if (p.length < 4) return setPinText(p);
    setPinText('');
    if (creating) {
      if (!first) return setFirst(p);
      if (p !== first) {
        setFirst(null);
        return setError("Those PINs didn't match. Start again.");
      }
      setPin(p);
      return pass();
    }
    if (checkPin(p)) return pass();
    setFails((f) => f + 1);
    setError(fails >= 2 ? 'Wrong PIN. Try the grown-up check instead, or see “Forgot PIN?”' : 'That PIN is not right.');
  };

  const checkMath = () => {
    if (Number(answer) === question.a * question.b) return pass();
    setAnswer('');
    setError('Not quite. Try again.');
  };

  const heading = creating ? (first ? 'Type the PIN again' : 'Create a parent PIN') : 'Parent gate';
  return (
    <Screen bg={colors.kidsCanvas}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <RoundButton icon="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/kids'))} />
        <Text style={kidsText.h2}>Grown-ups only</Text>
      </View>
      <KidsCard style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 56 }} accessibilityElementsHidden>🦚🔒</Text>
        <Text style={[kidsText.title, { textAlign: 'center' }]}>{heading}</Text>
        <K style={{ textAlign: 'center', color: colors.muted }}>
          {creating ? 'Choose 4 digits your child doesn’t know. You’ll need them to leave Kids mode or change limits.' : 'Enter your 4-digit parent PIN to manage screen time or leave Kids mode.'}
        </K>

        {!creating ? (
          <View style={{ flexDirection: 'row', backgroundColor: '#F3EAD6', borderRadius: 24, padding: 4 }} accessibilityRole="tablist">
            {(['pin', 'math'] as const).map((t) => (
              <Pressable key={t} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => { setTab(t); setError(''); }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: tab === t ? colors.indigo : 'transparent' }}>
                <Text style={{ fontFamily: fonts.kids, fontSize: 16, color: tab === t ? colors.white : colors.indigo }}>{t === 'pin' ? '4-digit PIN' : 'Grown-up check'}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {tab === 'pin' || creating ? (
          <>
            <View style={{ flexDirection: 'row', gap: space.lg, marginVertical: space.sm }} accessibilityLabel={`${pin.length} of 4 digits entered`}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: i < pin.length ? colors.indigo : '#E8DFC9', borderWidth: i === pin.length ? 2 : 0, borderColor: colors.teal }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'center', maxWidth: 330 }}>
              {KEYS.map((k) => (
                <Pressable key={k} accessibilityRole="button" accessibilityLabel={k === 'del' ? 'Delete' : k === 'clear' ? 'Clear' : k} onPress={() => press(k)}
                  style={({ pressed }) => [{ width: 96, height: 68, borderRadius: 34, backgroundColor: '#F3EAD6', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: '#DCCDAE' }, pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 1 }]}>
                  <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: k.length > 1 ? 17 : 28, color: k === 'del' ? colors.danger : colors.indigo }}>{k === 'del' ? '⌫' : k === 'clear' ? 'Clear' : k}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View style={{ alignSelf: 'stretch', gap: space.md }}>
            <Text style={[kidsText.title, { textAlign: 'center' }]}>{question.a} × {question.b} = ?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                <Pressable key={d} accessibilityRole="button" accessibilityLabel={d} onPress={() => setAnswer((a) => (a + d).slice(0, 3))}
                  style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3EAD6', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.kidsHeavy, fontSize: 22, color: colors.indigo }}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[kidsText.title, { textAlign: 'center' }]} accessibilityLabel={`Answer ${answer || 'empty'}`}>{answer || '—'}</Text>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}><KidsButton kind="cream" small label="Clear" onPress={() => setAnswer('')} /></View>
              <View style={{ flex: 1 }}><KidsButton small label="Check" onPress={checkMath} disabled={!answer} /></View>
            </View>
          </View>
        )}
        {error ? <Text accessibilityRole="alert" style={{ fontFamily: fonts.kidsMedium, color: colors.danger, fontSize: 15, textAlign: 'center' }}>{error}</Text> : null}
      </KidsCard>
      {!creating ? (
        <KidsCard tone="cream">
          <Text style={[kidsText.small, { fontFamily: fonts.kids, color: colors.teal }]}>Forgot PIN?</Text>
          <K style={{ fontSize: 15 }}>Sign out of Gita Path on this phone and sign back in. That clears the Kids PIN so you can set a new one. If you sign in with an account, your children’s profiles and stars come back afterwards.</K>
        </KidsCard>
      ) : null}
    </Screen>
  );
}
