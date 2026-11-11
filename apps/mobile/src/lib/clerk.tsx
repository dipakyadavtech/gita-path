// Clerk sign-in. Only active when EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is set (see .env.example).
// Setup in the Clerk dashboard:
//   1. User & authentication → enable "Phone number" with SMS verification code.
//   2. SSO connections → enable Google and Apple.
//   3. Native applications → add the redirect URL  gitapath://  (the app scheme in app.json).
// The API verifies Clerk tokens when CLERK_ISSUER is set on the server.
import { ClerkProvider, getClerkInstance, useAuth as useClerkAuth, useSignIn, useSignUp, useSSO, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
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
let pending: 'signIn' | 'signUp' | null = null;

const message = (e: unknown, fallback: string) =>
  isClerkAPIResponseError(e) ? e.errors[0]?.longMessage ?? e.errors[0]?.message ?? fallback : fallback;

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
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { startSSOFlow } = useSSO();

  return {
    async startPhone(phone: string) {
      if (!signIn || !signUp) throw new Error('Sign-in is still loading. Try again in a moment.');
      const identifier = toE164(phone);
      try {
        const attempt = await signIn.create({ identifier });
        const factor = attempt.supportedFirstFactors?.find((f) => f.strategy === 'phone_code');
        if (!factor || !('phoneNumberId' in factor)) throw new Error('Phone sign-in is not enabled in Clerk.');
        await signIn.prepareFirstFactor({ strategy: 'phone_code', phoneNumberId: factor.phoneNumberId });
        pending = 'signIn';
      } catch (e) {
        // New number → create an account instead.
        if (isClerkAPIResponseError(e) && e.errors[0]?.code === 'form_identifier_not_found') {
          await signUp.create({ phoneNumber: identifier });
          await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
          pending = 'signUp';
        } else {
          throw new Error(message(e, e instanceof Error ? e.message : 'Could not send the code.'));
        }
      }
      return true;
    },
    async verifyOtp(phone: string, code: string): Promise<Session> {
      try {
        if (pending === 'signUp' && signUp) {
          const r = await signUp.attemptPhoneNumberVerification({ code });
          if (r.status !== 'complete' || !r.createdSessionId) throw new Error('Please finish sign-up in the app.');
          await setSignUpActive!({ session: r.createdSessionId });
        } else if (signIn) {
          const r = await signIn.attemptFirstFactor({ strategy: 'phone_code', code });
          if (r.status !== 'complete' || !r.createdSessionId) throw new Error('That code did not work.');
          await setSignInActive!({ session: r.createdSessionId });
        }
      } catch (e) {
        throw new Error(message(e, e instanceof Error ? e.message : 'That code is not right.'));
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
