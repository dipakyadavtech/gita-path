// Screen-time and bedtime rules (K10). All times are the phone's local time.
import { todayKey } from '../dates';
import type { KidsSettings } from './store';

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function inBedtime(s: KidsSettings, now = new Date()) {
  if (!s.bedtimeOn) return false;
  const t = now.getHours() * 60 + now.getMinutes();
  const start = toMin(s.bedtimeStart);
  const end = toMin(s.bedtimeEnd);
  return start > end ? t >= start || t < end : t >= start && t < end;
}

export function secondsLeft(
  s: KidsSettings,
  usage: { date: string; seconds: number } | undefined,
  extra: { date: string; minutes: number } | null,
) {
  const today = todayKey();
  const used = usage && usage.date === today ? usage.seconds : 0;
  const bonus = extra && extra.date === today ? extra.minutes : 0;
  return Math.max(0, (s.dailyLimitMin + bonus) * 60 - used);
}

export const fmtLeft = (sec: number) => (sec >= 60 ? `${Math.ceil(sec / 60)}m left` : `${sec}s left`);

/** "7:30 PM" from "19:30". */
export function fmtClock(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
