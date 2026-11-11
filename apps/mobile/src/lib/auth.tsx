// Authentication.
// - Dev mode (default): phone OTP is simulated. The code is always 123456. Google/Apple sign in instantly.
// - Clerk mode: set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (see apps/mobile/.env.example) and the Clerk
//   provider in src/lib/clerk.tsx takes over sign-in. The rest of the app only uses useAuth().
import { router } from 'expo-router';
import { useApp, type Session } from './store';

export const DEV_OTP = '123456';
export const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const authMode: 'dev' | 'clerk' = CLERK_KEY ? 'clerk' : 'dev';

const randomId = () => Math.random().toString(36).slice(2, 10);

export function useAuth() {
  const session = useApp((s) => s.session);
  const setSession = useApp((s) => s.setSession);
  const reset = useApp((s) => s.reset);

  return {
    session,
    mode: authMode,
    /** Starts phone sign-in. Returns true when an OTP was sent. */
    async startPhone(phone: string) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length !== 10) throw new Error('Enter a 10-digit mobile number.');
      return true;
    },
    async verifyOtp(phone: string, code: string) {
      if (code !== DEV_OTP) throw new Error('That code is not right. In dev mode the code is 123456.');
      const s: Session = { userId: `dev-${phone.replace(/\D/g, '')}`, name: 'Priya', phone, provider: 'dev' };
      setSession(s);
      return s;
    },
    async socialSignIn(provider: 'google' | 'apple') {
      const s: Session = { userId: `dev-${provider}-${randomId()}`, name: 'Priya', provider: 'dev' };
      setSession(s);
      return s;
    },
    async guest() {
      const s: Session = { userId: `guest-${randomId()}`, name: 'Friend', provider: 'guest' };
      setSession(s);
      return s;
    },
    signOut() {
      reset();
      router.replace('/splash');
    },
  };
}
