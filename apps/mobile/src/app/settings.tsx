import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button, Screen, TopBar } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { type } from '@/theme';

// A2 · Settings (expanded in milestone M4)
export default function Settings() {
  const auth = useAuth();
  return (
    <Screen>
      <TopBar title="Settings" />
      <Text style={type.bodyMuted}>Language, reminders and privacy settings arrive in the next build.</Text>
      <Button label="Languages" kind="ghost" onPress={() => router.push('/languages')} />
      <Button label="Sign out" kind="ghost" onPress={auth.signOut} />
    </Screen>
  );
}
