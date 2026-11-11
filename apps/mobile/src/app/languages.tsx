import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Caps, Chip, Screen, TopBar, Wrap } from '@/components/ui';
import { LANGUAGES, VERSE_SCRIPTS } from '@/lib/languages';
import { useApp } from '@/lib/store';
import { colors, radius, type } from '@/theme';

// S7 · Languages: text, verse script and narration are chosen separately (FR-LN-01).
type Target = 'appLanguage' | 'verseScript' | 'narration';
const TARGETS: { id: Target; label: string }[] = [
  { id: 'appLanguage', label: 'App text' },
  { id: 'verseScript', label: 'Shloka script' },
  { id: 'narration', label: 'Narration' },
];

export default function Languages() {
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const [target, setTarget] = useState<Target>('appLanguage');

  return (
    <Screen>
      <TopBar title="Choose your language" />
      <Text style={type.bodyMuted}>22 Indian languages + English. Hindi and English are live now; the rest arrive in Releases 2 and 3.</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {TARGETS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTarget(t.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: target === t.id }}
            style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: target === t.id ? colors.indigoTint : colors.white, borderWidth: target === t.id ? 2 : 1, borderColor: target === t.id ? colors.indigo : colors.line }}
          >
            <Text style={type.small}>{t.label}</Text>
            <Text style={type.label} numberOfLines={1}>{prefs[t.id]}</Text>
          </Pressable>
        ))}
      </View>
      {target === 'verseScript' ? (
        <View style={{ gap: 10 }}>
          <Caps>Show Sanskrit verses in</Caps>
          <Wrap>
            {VERSE_SCRIPTS.map((s) => (
              <Chip key={s} label={s} active={prefs.verseScript === s} onPress={() => setPrefs({ verseScript: s })} />
            ))}
          </Wrap>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {LANGUAGES.map((l) => {
            const value = target === 'appLanguage' ? l.native : l.native;
            const on = prefs[target] === value;
            const live = l.phase === 1;
            return (
              <Pressable
                key={l.english}
                disabled={!live}
                onPress={() => setPrefs({ [target]: value })}
                accessibilityRole="radio"
                accessibilityState={{ checked: on, disabled: !live }}
                accessibilityLabel={`${l.english}${live ? '' : ', coming soon'}`}
                style={{ width: '48.5%', minHeight: 56, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, backgroundColor: on ? colors.indigoTint : colors.white, borderWidth: on ? 2 : 1, borderColor: on ? colors.indigo : colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: live ? 1 : 0.75 }}
              >
                <View>
                  <Text style={[type.label, { fontSize: 16 }]}>{l.native}</Text>
                  <Text style={type.small}>{l.english}</Text>
                </View>
                <Text style={[type.small, { color: live ? colors.teal : l.phase === 2 ? colors.saffron : colors.muted, fontWeight: '700' }]}>
                  {live ? 'Available' : `Phase ${l.phase}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
