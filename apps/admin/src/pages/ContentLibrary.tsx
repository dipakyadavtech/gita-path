// W1 · Scriptural content library — what is live in the app right now.
import { useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { ErrorBox, Loading } from '../components/States';
import { adminApi, strapiVerseLink, type Stats } from '../lib/api';
import { useAsync } from '../lib/useAsync';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function ContentLibrary() {
  const stats = useOutletContext<{ data?: Stats }>();
  const verses = useAsync(() => adminApi.verses(), []);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [chapter, setChapter] = useState('all');
  const [theme, setTheme] = useState('all');

  const all = useMemo(() => verses.data ?? [], [verses.data]);
  const chapters = useMemo(() => [...new Set(all.map((r) => r.verse.chapter))].sort((a, b) => a - b), [all]);
  const themes = useMemo(() => [...new Set(all.flatMap((r) => r.verse.themes))].sort(), [all]);
  const rows = useMemo(() => {
    const n = norm(q.trim());
    return all
      .filter((r) => chapter === 'all' || String(r.verse.chapter) === chapter)
      .filter((r) => theme === 'all' || r.verse.themes.includes(theme))
      .filter((r) => !n || [r.verse.id, r.verse.iast, r.verse.meaning, r.verse.sanskrit.join(' ')].some((t) => norm(t).includes(n)))
      .sort((a, b) => a.verse.chapter - b.verse.chapter || a.verse.number - b.verse.number);
  }, [all, q, chapter, theme]);

  const s = stats.data;
  return (
    <main className="page">
      <div className="page-head">
        <div>
          <span className="pill saffron">Bhagavad Gita · live corpus</span>
          <h1>Scriptural Content Library</h1>
          <p className="muted" style={{ margin: 0 }}>Every verse the app serves right now, with the checksum that locks its Sanskrit. To edit, open it in Strapi: publishing there needs an approved review.</p>
        </div>
        <a className="btn primary" href={strapiVerseLink()} target="_blank" rel="noreferrer">+ Add or edit verses in Strapi ↗</a>
      </div>

      <section className="grid4" aria-label="Summary">
        <div className="card stat"><span className="caps">Verses live</span><div className="num">{s?.versesLive ?? '–'}<span className="muted" style={{ fontSize: 16 }}> / 700</span></div><span className="small muted">{s?.chaptersWithVerses ?? '–'} of 18 chapters started</span></div>
        <div className="card stat"><span className="caps">Story episodes</span><div className="num saffron">{s?.storiesLive ?? '–'}</div><span className="small muted">Mahabharata series</span></div>
        <div className="card stat"><span className="caps">Verses completed today</span><div className="num teal">{s?.stepsCompletedToday ?? '–'}</div><span className="small muted">across all learners</span></div>
        <div className="card stat"><span className="caps">Learners</span><div className="num indigo">{s?.users ?? '–'}</div><span className="small muted">signed-in accounts</span></div>
      </section>

      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="row">
          <input style={{ flex: 1, minWidth: 220 }} value={q} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} placeholder="Search by verse (2.47), Sanskrit (कर्मण्ये), IAST or meaning" aria-label="Search verses" />
          <label style={{ flexDirection: 'row', alignItems: 'center' }}><span className="caps">Adhyaya</span>
            <select value={chapter} onChange={(e) => setChapter(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All chapters</option>
              {chapters.map((c) => <option key={c} value={c}>Chapter {c}</option>)}
            </select>
          </label>
          <label style={{ flexDirection: 'row', alignItems: 'center' }}><span className="caps">Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All themes</option>
              {themes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
      </section>

      {verses.loading ? <Loading /> : verses.error ? <ErrorBox message={verses.error} retry={verses.reload} /> : (
        <section className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <span className="caps">Showing {rows.length} of {all.length} verses</span>
          </div>
          <table>
            <thead><tr><th className="caps">Verse</th><th className="caps">Devanagari &amp; IAST</th><th className="caps">Themes</th><th className="caps">Sanskrit lock</th><th className="caps">Last sync</th><th /></tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={6} className="empty">No verses match. Clear the search or filters.</td></tr> : rows.map(({ verse: v, checksum, updatedAt }) => (
                <tr key={v.id}>
                  <td><Link className="ref" to={`/verses/${v.id}`}>{v.id}</Link><div className="small muted">Chapter {v.chapter}</div></td>
                  <td style={{ minWidth: 320 }}>
                    <div className="verse" style={{ fontSize: 17 }}>{v.sanskrit.map((l, i) => <div key={i}>{l}</div>)}</div>
                    <div className="iast">{v.iast}</div>
                  </td>
                  <td><div className="row">{v.themes.map((t) => <span key={t} className="pill teal">{t}</span>)}</div></td>
                  <td><span className="pill ok mono" style={{ whiteSpace: 'nowrap' }} title={checksum ?? ''}>{checksum?.slice(0, 10) ?? '—'}</span></td>
                  <td className="small muted">{updatedAt ? new Date(updatedAt).toLocaleString() : '—'}</td>
                  <td><Link className="btn" to={`/verses/${v.id}`}>Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
