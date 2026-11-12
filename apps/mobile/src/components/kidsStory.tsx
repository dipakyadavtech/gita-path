// Shared bits for the kids story screens.
import { router } from 'expo-router';
import { Text } from 'react-native';
import { todayKey } from '@/lib/dates';
import { shlokaOfTheDay } from '@/lib/kids/content';
import { useCurrentKid, useKids } from '@/lib/kids/store';
import { K, KidsButton, KidsCard, kidsText } from './kids';

export const STORY_EMOJI: Record<string, string> = { k1: '🏺', k2: '⛰️', k3: '🌊' };

export function ChantGateCard() {
  const shloka = shlokaOfTheDay(todayKey());
  return (
    <KidsCard tone="sun">
      <Text style={kidsText.h2}>🎵 Sing first, then watch!</Text>
      <K>Your grown-up asked Moru to start the day with a shloka. Sing “{shloka.title}” and the stories unlock.</K>
      <KidsButton kind="teal" icon="mic" label="Sing with Moru" onPress={() => router.replace(`/kids/sing/${shloka.id}`)} />
    </KidsCard>
  );
}

export function useStoriesLocked() {
  const { progress } = useCurrentKid();
  const chantGate = useKids((s) => s.settings.chantGate);
  return chantGate && !progress.days[todayKey()]?.shloka;
}

