import type { Circle, CircleMember } from './store';

const COLORS = ['#7C3AED', '#0F5E63', '#2563EB', '#DB2777', '#C2410C', '#059669', '#9333EA', '#0891B2'];
export const MAX_MEMBERS = 8;

const code = () => Math.random().toString(36).slice(2, 6).toUpperCase();

export function newCircle(owner: { id: string; name: string }, name: string): Circle {
  return {
    id: `c-${Date.now()}`,
    name,
    code: code(),
    ownerId: owner.id,
    challenge: { title: 'Finish Chapter 2 together', chapter: 2, target: 72 },
    members: [{ id: owner.id, name: owner.name, color: COLORS[4], done: 0, status: 'member', isMe: true }],
    feed: [{ who: owner.name, what: 'created the Circle', at: new Date().toISOString() }],
  };
}

export function inviteLink(c: Circle) {
  return `https://gitapath.app/c/${c.code}`;
}

/** Dev helper: simulates someone opening the invite link (they wait for approval, FR-FC-06). */
export function simulateJoinRequest(c: Circle, name: string): Circle {
  const m: CircleMember = { id: `m-${Date.now()}`, name, color: COLORS[c.members.length % COLORS.length], done: Math.floor(Math.random() * 20), status: 'pending' };
  return { ...c, members: [...c.members, m] };
}

export function approve(c: Circle, id: string): Circle {
  const m = c.members.find((x) => x.id === id);
  return {
    ...c,
    members: c.members.map((x) => (x.id === id ? { ...x, status: 'member' } : x)),
    feed: m ? [{ who: m.name, what: 'joined the Circle', at: new Date().toISOString() }, ...c.feed] : c.feed,
  };
}

export function removeMember(c: Circle, id: string): Circle {
  return { ...c, members: c.members.filter((x) => x.id !== id) };
}

export const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
};
