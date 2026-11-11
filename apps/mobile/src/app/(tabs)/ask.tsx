import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Caps, Icon, Row } from '@/components/ui';
import { verseById } from '@/lib/content';
import { FREE_DAILY_QUESTIONS, answerLocally } from '@/lib/guide';
import { useApp } from '@/lib/store';
import type { AskResult } from '@/lib/types';
import { colors, fonts, radius, type } from '@/theme';

// E1 · Ask the Gita
type Msg = { id: string; from: 'me' | 'gita'; text?: string; result?: AskResult };

const MOOD_PROMPTS: Record<string, string> = {
  Anxious: "I feel anxious and can't settle my mind.",
  'Exam stress': "I'm stressed about my exams and scared of the results.",
  'Lost motivation': "I've lost my motivation and keep putting things off.",
  Anger: 'I get angry quickly and say things I regret.',
  'Feeling stuck': 'I feel stuck in my life and do not know what to do next.',
};

export default function Ask() {
  const params = useLocalSearchParams<{ mood?: string; verse?: string }>();
  const plan = useApp((s) => s.plan);
  const countAsk = useApp((s) => s.countAsk);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (params.mood && MOOD_PROMPTS[params.mood]) setInput(MOOD_PROMPTS[params.mood]);
    else if (params.verse) setInput(`What does verse ${params.verse} mean for my daily life?`);
  }, [params.mood, params.verse]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const result = answerLocally(q);
    if (result.kind === 'safety') {
      router.push({ pathname: '/ask-safety', params: { q } });
      setInput('');
      return;
    }
    const n = countAsk();
    if (plan === 'free' && n > FREE_DAILY_QUESTIONS) {
      router.push('/ask-limit');
      return;
    }
    setMsgs((m) => [...m, { id: `${Date.now()}q`, from: 'me', text: q }, { id: `${Date.now()}a`, from: 'gita', result }]);
    setInput('');
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 20, gap: 14 }}>
          <View>
            <Text style={type.h1}>Ask the Gita</Text>
            <Text style={type.bodyMuted}>Every answer is grounded in verses you can open.</Text>
          </View>
          {msgs.length === 0 ? (
            <View style={{ gap: 8 }}>
              <Caps>Try asking</Caps>
              {Object.values(MOOD_PROMPTS).slice(0, 3).map((p) => (
                <Pressable key={p} onPress={() => setInput(p)} accessibilityRole="button" style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }}>
                  <Text style={type.body}>{p}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {msgs.map((m) =>
            m.from === 'me' ? (
              <View key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.indigo, padding: 12, borderRadius: 18, borderBottomRightRadius: 4 }}>
                <Text style={[type.body, { color: colors.white }]}>{m.text}</Text>
              </View>
            ) : m.result?.kind === 'answer' ? (
              <View key={m.id} style={{ maxWidth: '94%', backgroundColor: colors.tealTint, padding: 14, borderRadius: 18, borderBottomLeftRadius: 4, gap: 10 }}>
                <Text style={type.body}>{m.result.text}</Text>
                {m.result.verses.map((id) => {
                  const v = verseById(id)!;
                  return (
                    <Pressable key={id} onPress={() => router.push({ pathname: '/verse/[id]', params: { id } })} accessibilityRole="link" accessibilityLabel={`Open Bhagavad Gita ${id}`} style={{ backgroundColor: colors.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.line }}>
                      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.saffron }}>BHAGAVAD GITA {id}</Text>
                      <Text style={{ fontFamily: fonts.verseBold, fontSize: 15, color: colors.ink, marginTop: 4 }}>{v.sanskrit[0]}</Text>
                      <Text style={type.small} numberOfLines={2}>{v.meaning}</Text>
                    </Pressable>
                  );
                })}
                <Text style={[type.body, { fontFamily: fonts.bodySemi }]}>Try today: {m.result.action}</Text>
              </View>
            ) : null,
          )}
          <Text style={type.small}>Guidance from scripture, not professional advice. If you feel overwhelmed, talk to someone you trust.</Text>
        </ScrollView>
        <Row gap={8} style={{ padding: 12, paddingBottom: 16 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about life, work, family…"
            placeholderTextColor="#9A99AD"
            accessibilityLabel="Your question"
            onSubmitEditing={send}
            style={{ flex: 1, minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15 }}
          />
          <Pressable onPress={send} accessibilityRole="button" accessibilityLabel="Send" style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" color={colors.white} />
          </Pressable>
        </Row>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
