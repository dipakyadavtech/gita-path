// Authentication — every screen uses useAuth(), whatever the mode.
// - Dev mode (default): phone OTP is simulated; the code is always 123456. Google/Apple sign in instantly.
//   If EXPO_PUBLIC_API_URL is set, the app also gets a dev token from the API so progress syncs.
// - Clerk mode: set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (see .env.example). Real SMS codes and Google/Apple,
//   handled in src/lib/clerk.tsx.
import { router } from 'expo-router';
import { apiEnabled, devToken, pullProgress } from './api';
import { useClerkFlows } from './clerk';
import { authMode } from './config';
import { useKids } from './kids/store';
import { useApp, type Session } from './store';

export { authMode } from './config';
export const DEV_OTP = '123456';

const randomId = () => Math.random().toString(36).slice(2, 10);

// Dev versions of the Clerk flows. authMode never changes while the app runs, so picking
// the hook once here keeps the rules of hooks.
function useDevFlows() {
  return {
    async startPhone(_phone: string) {
      return true;
    },
    async verifyOtp(phone: string, code: string): Promise<Session> {
      if (code !== DEV_OTP) throw new Error('That code is not right. In dev mode the code is 123456.');
      const digits = phone.replace(/\D/g, '');
      const s: Session = { userId: `dev-${digits}`, name: 'Priya', phone, provider: 'dev' };
      if (apiEnabled) {
        try {
          const r = await devToken(digits, code, s.name);
          s.token = r.token;
          s.userId = r.userId;
        } catch {
          throw new Error('Could not reach the Gita Path server. Check EXPO_PUBLIC_API_URL or try again.');
        }
      }
      return s;
    },
    async socialSignIn(provider: 'google' | 'apple'): Promise<Session | null> {
      return { userId: `dev-${provider}-${randomId()}`, name: 'Priya', provider: 'dev' };
    },
    async signOut() {},
  };
}

const useFlows = authMode === 'clerk' ? useClerkFlows : useDevFlows;

export function useAuth() {
  const session = useApp((s) => s.session);
  const setSession = useApp((s) => s.setSession);
  const reset = useApp((s) => s.reset);
  const flows = useFlows();

  const signedIn = (s: Session) => {
    setSession(s);
    pullProgress().catch(() => {});
    return s;
  };

  return {
    session,
    mode: authMode,
    /** Sends an OTP. Returns true when a code was sent. */
    async startPhone(phone: string) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length !== 10) throw new Error('Enter a 10-digit mobile number.');
      return flows.startPhone(digits);
    },
    async verifyOtp(phone: string, code: string) {
      return signedIn(await flows.verifyOtp(phone, code));
    },
    async socialSignIn(provider: 'google' | 'apple') {
      const s = await flows.socialSignIn(provider);
      return s ? signedIn(s) : null;
    },
    async guest() {
      const s: Session = { userId: `guest-${randomId()}`, name: 'Friend', provider: 'guest' };
      setSession(s);
      return s;
    },
    async signOut() {
      await flows.signOut().catch(() => {});
      reset();
      useKids.getState().reset(); // also clears the Kids PIN ("Forgot PIN?")
      router.replace('/splash');
    },
  };
}
