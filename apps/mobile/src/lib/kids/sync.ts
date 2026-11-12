// Sends kids profiles, progress and settings to the API when a server is configured.
// Everything works offline; failures are ignored and the phone stays the source of truth.
import { api, apiEnabled } from '../api';
import { useApp } from '../store';
import type { KidProfile, KidsSettings } from './store';

const canSync = () => apiEnabled && !!useApp.getState().session && useApp.getState().session?.provider !== 'guest';

export function pushProfile(p: KidProfile) {
  if (!canSync()) return;
  api('/v1/kids/profiles', { method: 'POST', body: JSON.stringify(p) }).catch(() => {});
}
export function deleteProfile(id: string) {
  if (!canSync()) return;
  api(`/v1/kids/profiles/${id}`, { method: 'DELETE' }).catch(() => {});
}
export function pushProgress(kidId: string, kind: 'story' | 'shloka' | 'game', itemId: string, stars: number) {
  if (!canSync()) return;
  api(`/v1/kids/profiles/${kidId}/progress`, { method: 'POST', body: JSON.stringify({ kind, itemId, stars }) }).catch(() => {});
}
export function pushSettings(s: KidsSettings) {
  if (!canSync()) return;
  api('/v1/kids/settings', { method: 'PATCH', body: JSON.stringify(s) }).catch(() => {});
}

type ServerProgress = { stars: number; items: { kind: 'story' | 'shloka' | 'game'; itemId: string; stars: number; times: number }[] };

/** After signing in again on a phone: bring back profiles and stars saved on the server. */
export async function pullKids() {
  if (!canSync()) return;
  const { useKids, emptyKidProgress } = await import('./store');
  const profiles = await api<KidProfile[]>('/v1/kids/profiles');
  if (!profiles.length) return;
  const progress = { ...useKids.getState().progress };
  for (const p of profiles) {
    const r = await api<ServerProgress>(`/v1/kids/profiles/${p.id}/progress`);
    const local = progress[p.id] ?? emptyKidProgress();
    const stories = { ...local.stories };
    const shlokas = { ...local.shlokas };
    let games = local.games;
    for (const it of r.items) {
      if (it.kind === 'story') stories[it.itemId] ??= 'synced';
      else if (it.kind === 'shloka') shlokas[it.itemId] ??= 'synced';
      else games = Math.max(games, it.times);
    }
    progress[p.id] = { ...local, stars: Math.max(local.stars, r.stars), stories, shlokas, games };
  }
  useKids.setState((s) => ({
    profiles: [...s.profiles, ...profiles.filter((p) => !s.profiles.some((x) => x.id === p.id))],
    currentId: s.currentId ?? profiles[0].id,
    progress,
  }));
}
