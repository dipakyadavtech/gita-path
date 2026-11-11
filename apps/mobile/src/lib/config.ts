// Public build-time settings (EXPO_PUBLIC_* from apps/mobile/.env). Empty = demo/dev behaviour.
export const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
export const authMode: 'dev' | 'clerk' = CLERK_KEY ? 'clerk' : 'dev';
