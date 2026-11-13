// Where Clerk sends the browser back after Google/Apple sign-in (see redirectUrl in src/lib/clerk.tsx).
// The sign-in screen finishes the flow and moves on by itself; this screen only covers the moment the
// app is reopened by the callback link (Android), and falls back to the right place if nothing happens.
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useApp } from '@/lib/store';
import { colors, type } from '@/theme';

export default function SsoCallback() {
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(useApp.getState().session ? '/' : '/sign-in');
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.canvas }}>
      <ActivityIndicator color={colors.saffron} />
      <Text style={type.bodyMuted}>Finishing sign-in…</Text>
    </View>
  );
}
