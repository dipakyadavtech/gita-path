import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Icon, ProgressBar, Screen, TopBar } from '@/components/ui';
import { QUIZZES } from '@/lib/quiz';
import { useApp } from '@/lib/store';
import { colors, fonts, radius, type } from '@/theme';

// D7 · Chapter quiz
export default function Quiz() {
  const { chapter } = useLocalSearchParams<{ chapter: string }>();
  const n = Number(chapter);
  const questions = QUIZZES[n] ?? [];
  const saveQuiz = useApp((s) => s.saveQuiz);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  if (!questions.length) {
    return (
      <Screen>
        <TopBar title={`Chapter ${n} quiz`} />
        <Text style={type.body}>The quiz for this chapter is coming soon.</Text>
      </Screen>
    );
  }
  const q = questions[i];
  const answered = picked !== null;
  const last = i === questions.length - 1;

  const pick = (o: number) => {
    if (answered) return;
    setPicked(o);
    if (o === q.answer) setCorrect((c) => c + 1);
  };
  const next = () => {
    if (last) {
      saveQuiz(n, correct, questions.length);
      router.replace({ pathname: '/chapter-complete/[chapter]', params: { chapter: String(n) } });
      return;
    }
    setI(i + 1);
    setPicked(null);
  };

  return (
    <Screen footer={<Button label={last ? 'See results' : 'Next question'} onPress={next} disabled={!answered} />}>
      <TopBar title={`Chapter ${n} quiz`} right={<Text style={type.bodyMuted}>{i + 1} / {questions.length}</Text>} />
      <ProgressBar value={(i + (answered ? 1 : 0)) / questions.length} color={colors.teal} />
      <Text style={[type.h2, { fontSize: 22, lineHeight: 30 }]}>{q.q}</Text>
      <View style={{ gap: 10 }}>
        {q.options.map((o, idx) => {
          const isRight = answered && idx === q.answer;
          const isWrong = answered && idx === picked && idx !== q.answer;
          return (
            <Pressable
              key={o}
              onPress={() => pick(idx)}
              accessibilityRole="radio"
              accessibilityState={{ checked: picked === idx }}
              style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderRadius: radius.lg, borderWidth: isRight || isWrong ? 2 : 1, borderColor: isRight ? colors.teal : isWrong ? colors.danger : colors.line, backgroundColor: isRight ? colors.tealTint : isWrong ? colors.dangerTint : colors.white }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isRight ? colors.teal : isWrong ? colors.danger : '#B9B8C8', alignItems: 'center', justifyContent: 'center' }}>
                {isRight ? <Icon name="checkmark" size={14} color={colors.teal} /> : isWrong ? <Icon name="close" size={14} color={colors.danger} /> : null}
              </View>
              <Text style={[type.body, { flex: 1 }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <Card tone={picked === q.answer ? 'teal' : 'danger'}>
          <Text style={type.body}>
            <Text style={{ fontFamily: fonts.bodyBold, color: picked === q.answer ? colors.teal : colors.danger }}>{picked === q.answer ? 'Correct. ' : 'Not quite. '}</Text>
            {q.why}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
