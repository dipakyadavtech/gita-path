import { Redirect } from 'expo-router';
import { useKids } from '@/lib/kids/store';
import { useApp } from '@/lib/store';

/** Entry: sends people to the right place depending on sign-in and onboarding state. */
export default function Index() {
  const session = useApp((s) => s.session);
  const prefs = useApp((s) => s.prefs);
  const kidsActive = useKids((s) => s.active);
  if (!session) return <Redirect href="/splash" />;
  // The phone was handed to a child: reopen straight into Kids mode.
  if (kidsActive) return <Redirect href="/kids/home" />;
  if (!prefs.whoFor) return <Redirect href="/who-for" />;
  if (!prefs.onboarded) return <Redirect href="/goals" />;
  return <Redirect href="/(tabs)" />;
}
