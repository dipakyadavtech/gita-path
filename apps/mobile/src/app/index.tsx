import { Redirect } from 'expo-router';
import { useApp } from '@/lib/store';

/** Entry: sends people to the right place depending on sign-in and onboarding state. */
export default function Index() {
  const session = useApp((s) => s.session);
  const prefs = useApp((s) => s.prefs);
  if (!session) return <Redirect href="/splash" />;
  if (!prefs.whoFor) return <Redirect href="/who-for" />;
  if (!prefs.onboarded) return <Redirect href="/goals" />;
  return <Redirect href="/(tabs)" />;
}
