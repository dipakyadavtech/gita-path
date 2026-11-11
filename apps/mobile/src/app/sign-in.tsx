import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Logo } from '@/components/Logo';
import { Button, Field, Row, Screen, TextLink } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, type } from '@/theme';

// S2 · Sign in
export default function SignIn() {
  const auth = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    setError('');
    setBusy(true);
    try {
      await auth.startPhone(phone);
      router.push({ pathname: '/otp', params: { phone } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const social = async (p: 'google' | 'apple') => {
    await auth.socialSignIn(p);
    router.replace('/permissions');
  };

  return (
    <Screen>
      <Logo size={52} />
      <View style={{ gap: 6 }}>
        <Text style={type.h1}>Begin your sadhana</Text>
        <Text style={type.bodyMuted}>Enter your mobile number to get a one-time code. No password needed.</Text>
      </View>
      <Row gap={10} style={{ alignItems: 'flex-end' }}>
        <View style={{ height: 52, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, justifyContent: 'center' }}>
          <Text style={type.label}>+91</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="98765 43210" maxLength={11} />
        </View>
      </Row>
      {error ? <Text style={[type.small, { color: colors.danger }]} accessibilityRole="alert">{error}</Text> : null}
      <Button label="Send OTP" icon="arrow-forward" onPress={sendOtp} loading={busy} />
      <Row gap={12}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <Text style={type.small}>or continue with</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </Row>
      <Button label="Continue with Google" icon="logo-google" kind="ghost" onPress={() => social('google')} />
      <Button label="Continue with Apple" icon="logo-apple" kind="ghost" onPress={() => social('apple')} />
      <TextLink label="Try as a guest for 3 days" onPress={async () => { await auth.guest(); router.replace('/who-for'); }} />
      {auth.mode === 'dev' ? (
        <Text style={[type.small, { textAlign: 'center' }]}>Dev mode: any 10-digit number works and the code is 123456.</Text>
      ) : null}
      <Text style={[type.small, { textAlign: 'center' }]}>By continuing you agree to the Terms and Privacy Policy. We never sell your data.</Text>
    </Screen>
  );
}
