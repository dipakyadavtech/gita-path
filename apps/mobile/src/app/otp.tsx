import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { Button, Screen, TopBar } from '@/components/ui';
import { DEV_OTP, useAuth } from '@/lib/auth';
import { colors, fonts, type } from '@/theme';

// S3 · Verify code
export default function Otp() {
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const auth = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);
  const input = useRef<TextInputInstance>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const verify = async (value = code) => {
    setError('');
    try {
      await auth.verifyOtp(phone, value);
      router.replace('/permissions');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen>
      <TopBar />
      <View style={{ gap: 6 }}>
        <Text style={type.h1}>Enter the code</Text>
        <Text style={type.bodyMuted}>We sent a 6-digit code to +91 {phone}.</Text>
      </View>
      <Pressable onPress={() => input.current?.focus()} accessibilityLabel="One-time code" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ width: 48, height: 58, borderRadius: 14, borderWidth: i === code.length ? 2 : 1, borderColor: i === code.length ? colors.indigo : colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.heading, fontSize: 24, color: colors.ink }}>{code[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={input}
        value={code}
        onChangeText={(t) => {
          const v = t.replace(/\D/g, '').slice(0, 6);
          setCode(v);
          if (v.length === 6) verify(v);
        }}
        keyboardType="number-pad"
        autoFocus
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        accessibilityLabel="Code input"
      />
      {error ? <Text style={[type.small, { color: colors.danger }]} accessibilityRole="alert">{error}</Text> : null}
      <Text style={type.bodyMuted}>{seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : 'You can resend the code now.'}</Text>
      <Button label="Verify" onPress={() => verify()} disabled={code.length < 6} />
      {auth.mode === 'dev' ? (
        <Button label={`Fill dev code ${DEV_OTP}`} kind="ghost" onPress={() => { setCode(DEV_OTP); verify(DEV_OTP); }} />
      ) : null}
    </Screen>
  );
}
