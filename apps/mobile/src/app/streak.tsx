import { router, useLocalSearchParams } from 'expo-router';
import { Share, Text, View } from 'react-native';
import { Button, Icon, Screen, TextLink } from '@/components/ui';
import { useApp } from '@/lib/store';
import { colors, fonts, type } from '@/theme';

// D5 · Streak milestone
const BADGES: Record<number, string> = { 7: 'First Week', 21: 'Steady Mind', 50: 'Deep Roots', 108: 'Mala Complete' };

export default function Streak() {
  const params = useLocalSearchParams<{ days?: string }>();
  const streak = useApp((s) => s.streak);
  const days = Number(params.days) || streak.current;
  const badge = BADGES[days];
  return (
    <Screen
      bg={colors.indigo}
      scroll={false}
      footer={
        <>
          <Button label="Share with my Circle" icon="share-outline" onPress={() => Share.share({ message: `I have studied the Bhagavad Gita for ${days} days in a row on Gita Path.` })} />
          <Button label="Continue" kind="ghost" onPress={() => router.replace('/(tabs)')} />
        </>
      }
    >
      <View style={{ alignItems: 'flex-end' }}>
        <TextLink label="Close" onPress={() => router.replace('/(tabs)')} color={colors.indigoText} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <View style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: colors.indigoSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="flame" size={84} color={colors.goldSoft} />
        </View>
        <Text style={{ fontFamily: fonts.headingBold, fontSize: 40, color: colors.white }}>{days} {days === 1 ? 'day' : 'days'}</Text>
        <Text style={[type.body, { color: '#E2E0F8', textAlign: 'center', maxWidth: 300 }]}>
          {badge ? `You've earned the ${badge} badge. Keep the flame steady.` : 'Every day you return, the habit grows stronger.'}
        </Text>
        <Text style={[type.small, { color: colors.indigoText }]}>{streak.freezes} streak freeze available this week</Text>
      </View>
    </Screen>
  );
}
