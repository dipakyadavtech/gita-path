// Remembers a successful parent-gate check for a few minutes (in memory only, never saved).
let unlockedUntil = 0;
export const unlockParent = () => {
  unlockedUntil = Date.now() + 5 * 60_000;
};
export const parentUnlocked = () => Date.now() < unlockedUntil;
export const lockParent = () => {
  unlockedUntil = 0;
};
