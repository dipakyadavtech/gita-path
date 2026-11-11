import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, Field, Icon, Screen, TextLink, TopBar } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, type } from '@/theme';

// A4 · Delete account (FR-PR-02). With the API connected this also calls DELETE /v1/me.
export default function DeleteAccount() {
  const auth = useAuth();
  const [text, setText] = useState('');
  return (
    <Screen footer={<Button label="Delete my account" kind="danger" disabled={text.trim().toUpperCase() !== 'DELETE'} onPress={auth.signOut} />}>
      <TopBar title="Delete account" />
      <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.dangerTint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="trash-outline" size={28} color={colors.danger} />
      </View>
      <Text style={type.h1}>This can&apos;t be undone</Text>
      <Card>
        {['Your progress, streaks, badges and notes', 'Your Ask the Gita history', 'Kids profiles under this account', 'Your place in your Family Circle'].map((t) => (
          <Text key={t} style={[type.body, { paddingVertical: 4 }]}>•  {t}</Text>
        ))}
      </Card>
      <TextLink label="Download my data first" onPress={() => router.push('/settings')} />
      <Field label="Type DELETE to confirm" value={text} onChangeText={setText} autoCapitalize="characters" placeholder="DELETE" />
      <Text style={type.small}>Data is erased from our servers within 30 days. An active subscription must be cancelled in your app store.</Text>
    </Screen>
  );
}
