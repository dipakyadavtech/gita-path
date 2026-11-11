// Staff sign-in.
// - Dev (default): any 10-digit number + OTP 123456 → admin dev token from the API.
// - Clerk: set VITE_CLERK_PUBLISHABLE_KEY. The API grants admin only to Clerk users listed in ADMIN_USERS.
import { ClerkProvider, SignIn, useAuth as useClerkAuth, useClerk, useUser } from '@clerk/clerk-react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminApi, setTokenGetter } from './api';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
export const authMode: 'dev' | 'clerk' = CLERK_KEY ? 'clerk' : 'dev';

type Staff = { name: string; userId: string };
type AuthValue = { staff: Staff | null; signOut: () => void };
const Ctx = createContext<AuthValue>({ staff: null, signOut: () => {} });
export const useStaff = () => useContext(Ctx);

const KEY = 'gp-admin-token';
const NAME = 'gp-admin-name';

function DevAuth({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(() => {
    const name = sessionStorage.getItem(NAME);
    const id = sessionStorage.getItem('gp-admin-user');
    return sessionStorage.getItem(KEY) && name && id ? { name, userId: id } : null;
  });
  const signOut = () => {
    sessionStorage.clear();
    setStaff(null);
  };
  if (!staff) return <DevSignIn onDone={setStaff} />;
  return <Ctx.Provider value={{ staff, signOut }}>{children}</Ctx.Provider>;
}

function DevSignIn({ onDone }: { onDone: (s: Staff) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return setError('Enter a 10-digit mobile number.');
    setBusy(true);
    try {
      const r = await adminApi.devToken(digits, otp, name.trim() || 'Reviewer');
      sessionStorage.setItem(KEY, r.token);
      sessionStorage.setItem(NAME, name.trim() || 'Reviewer');
      sessionStorage.setItem('gp-admin-user', r.userId);
      onDone({ name: name.trim() || 'Reviewer', userId: r.userId });
    } catch (err) {
      setError(err instanceof TypeError ? 'Cannot reach the API. Is it running on ' + (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '?' : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="signin">
      <form className="card signin-card" onSubmit={submit}>
        <div className="brand"><img src="/favicon.svg" alt="" width={36} height={36} /><div><b>Gita Path</b><small>STUDIO</small></div></div>
        <h1>Sign in to the Studio</h1>
        <p className="muted">Dev sign-in: any 10-digit number, code <b>123456</b>.</p>
        <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Radhakrishnan" /></label>
        <label>Mobile number<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="98765 43210" /></label>
        <label>One-time code<input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" /></label>
        {error ? <p className="error" role="alert">{error}</p> : null}
        <button className="btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

function ClerkBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
  if (!isLoaded) return <div className="signin"><p className="muted">Loading…</p></div>;
  if (!isSignedIn || !user) return <div className="signin"><SignIn routing="hash" /></div>;
  const staff = { name: user.fullName || user.primaryEmailAddress?.emailAddress || 'Reviewer', userId: user.id };
  return <Ctx.Provider value={{ staff, signOut: () => clerk.signOut() }}>{children}</Ctx.Provider>;
}

export function AuthGate({ children }: { children: ReactNode }) {
  if (authMode === 'clerk') {
    return (
      <ClerkProvider publishableKey={CLERK_KEY!}>
        <ClerkBridge>{children}</ClerkBridge>
      </ClerkProvider>
    );
  }
  return <DevAuth>{children}</DevAuth>;
}
