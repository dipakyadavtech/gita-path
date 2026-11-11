import { Text, View } from 'react-native';
import { Logo } from '@/components/Logo';
import { Button, Screen, TextLink } from '@/components/ui';
import { colors, fonts, type } from '@/theme';

// S1 · Splash
export default function Splash() {
  return (
    <Screen
      scroll={false}
      bg={colors.indigo}
      footer={
        <>
          <Button label="Get started" icon="arrow-forward" href="/sign-in" />
          <Text style={[type.small, { color: colors.indigoText, textAlign: 'center' }]}>Available in 22 Indian languages + English</Text>
        </>
      }
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Logo size={112} bg={colors.indigoSoft} />
        <Text style={{ fontFamily: fonts.headingBold, fontSize: 34, color: colors.white }}>Gita Path</Text>
        <Text style={{ fontFamily: fonts.verseBold, fontSize: 20, color: colors.goldSoft }}>हर दिन एक श्लोक</Text>
        <Text style={[type.body, { color: '#E2E0F8', textAlign: 'center', maxWidth: 280 }]}>
          Timeless wisdom for modern living in 10 mindful minutes a day.
        </Text>
        <Text style={[type.small, { color: colors.indigoText }]}>18 chapters · 700 verses</Text>
      </View>
      <TextLink label="I already have an account" href="/sign-in" color={colors.goldSoft} />
    </Screen>
  );
}
