// Clerk sign-in. Only active when EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is set (see .env.example).
// Setup in the Clerk dashboard:
//   1. User & authentication → enable "Phone number" with SMS verification code.
//   2. SSO connections → enable Google and Apple.
//   3. Native applications → add the redirect URL  gitapath://  (the app scheme in app.json).
// The API verifies Clerk tokens when CLERK_ISSUER is set on the server.
import { ClerkProvider, getClerkInstance, useAuth as useClerkAuth, useSignIn, useSignUp, useSSO, isClerkAPIResponseError } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, type ReactNode } from 'react';
import { setTokenProvider } from './api';
import { CLERK_KEY } from './config';
import type { Session } from './store';

WebBrowser.maybeCompleteAuthSession();

function TokenBridge() {
  const { getToken } = useClerkAuth();
  useEffect(() => {
    setTokenProvider(async () => (await getToken()) ?? undefined);
  }, [getToken]);
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!CLERK_KEY) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <TokenBridge />
      {children}
    </ClerkProvider>
  );
}

const toE164 = (phone: string) => `+91${phone.replace(/\D/g, '').slice(-10)}`;

// Which flow the code we sent belongs to: an existing account or a new one.
let pending: 'signIn' | 'signUp' | null = null;

// Clerk Core 3 returns { error } instead of throwing. API errors carry the detailed code in errors[0].
function errCode(e: unknown): string | undefined {
  if (isClerkAPIResponseError(e)) return e.errors[0]?.code;
  return (e as { code?: string } | null)?.code;
}
function errMessage(e: unknown, fallback: string): string {
  if (isClerkAPIResponseError(e)) return e.errors[0]?.longMessage ?? e.errors[0]?.message ?? fallback;
  const c = e as { longMessage?: string; message?: string } | null;
  return c?.longMessage ?? c?.message ?? fallback;
}
function check(result: { error: unknown }, fallback: string) {
  if (result.error) throw new Error(errMessage(result.error, fallback));
}

function sessionFromClerk(provider: Session['provider'], phone?: string): Session {
  const user = getClerkInstance().user;
  return {
    userId: user?.id ?? 'clerk-user',
    name: user?.firstName ?? 'Friend',
    phone,
    provider,
  };
}

/** Clerk versions of the sign-in actions used by useAuth(). */
export function useClerkFlows() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  return {
    async startPhone(phone: string) {
      const identifier = toE164(phone);
      const created = await signIn.create({ identifier });
      if (created.error) {
        // New number → create an account instead.
        if (errCode(created.error) !== 'form_identifier_not_found') {
          throw new Error(errMessage(created.error, 'Could not send the code.'));
        }
        check(await signUp.create({ phoneNumber: identifier }), 'Could not create your account.');
        check(await signUp.verifications.sendPhoneCode(), 'Could not send the code.');
        pending = 'signUp';
        return true;
      }
      check(await signIn.phoneCode.sendCode(), 'Phone sign-in is not enabled in Clerk.');
      pending = 'signIn';
      return true;
    },
    async verifyOtp(phone: string, code: string): Promise<Session> {
      if (pending === 'signUp') {
        check(await signUp.verifications.verifyPhoneCode({ code }), 'That code is not right.');
        // finalize() fails with a clear message if Clerk still needs more details (e.g. a required name).
        check(await signUp.finalize(), 'Please finish sign-up: more details are required in Clerk.');
      } else {
        check(await signIn.phoneCode.verifyCode({ code }), 'That code is not right.');
        check(await signIn.finalize(), 'Could not start your session.');
      }
      pending = null;
      return sessionFromClerk('clerk', phone);
    },
    async socialSignIn(provider: 'google' | 'apple'): Promise<Session | null> {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_apple',
        redirectUrl: Linking.createURL('/'),
      });
      if (!createdSessionId || !setActive) return null; // user closed the browser
      await setActive({ session: createdSessionId });
      return sessionFromClerk('clerk');
    },
    async signOut() {
      await getClerkInstance().signOut();
    },
  };
}
