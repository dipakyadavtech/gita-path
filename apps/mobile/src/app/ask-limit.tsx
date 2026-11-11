import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Icon, Screen } from '@/components/ui';
import { colors, type } from '@/theme';

// E3 · Question limit
export default function AskLimit() {
  return (
    <Screen footer={<><Button label="Try Plus free for 7 days" onPress={() => router.replace('/subscription')} /><Button label="Come back tomorrow" kind="ghost" onPress={() => router.replace('/(tabs)')} /></>}>
      <Text style={type.h1}>You&apos;ve asked 5 questions today</Text>
      <Text style={type.bodyMuted}>Free accounts get 5 questions a day. Your daily verse, path, audio and Family Circle stay free forever.</Text>
      {['Unlimited Ask the Gita', 'All animated stories and offline downloads', 'Detailed chanting feedback'].map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="checkmark-circle" color={colors.teal} />
          <Text style={type.body}>{t}</Text>
        </View>
      ))}
    </Screen>
  );
}
