// Small inline icons (no icon font needed).
const paths: Record<string, string> = {
  library: 'M4 5h4v14H4zM10 5h4v14h-4zM16.5 5.5l3.5 1-3.5 12.5-3.5-1z',
  shield: 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  check: 'M5 12l4 4 10-10',
  flag: 'M5 21V4h11l-2 4 2 4H5',
  back: 'M15 5l-7 7 7 7',
};
export function Icon({ name, size = 18 }: { name: keyof typeof paths | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[name] ?? ''} />
    </svg>
  );
}
