// W2 · Verse review — what learners see for one verse, with its locked Sanskrit and word meanings.
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ErrorBox, Loading } from '../components/States';
import { adminApi, strapiVerseLink } from '../lib/api';
import { useAsync } from '../lib/useAsync';

export function VerseReview() {
  const { id = '' } = useParams();
  const res = useAsync(() => adminApi.verse(id), [id]);

  if (res.loading) return <main className="page"><Loading /></main>;
  if (res.error || !res.data) return <main className="page"><ErrorBox message={res.error ?? 'Not found'} retry={res.reload} /></main>;
  const { verse: v, checksum, updatedAt } = res.data;

  return (
    <main className="page">
      <nav className="small muted row" aria-label="Breadcrumb"><Link to="/content">Content Library</Link> › Chapter {v.chapter} › <b style={{ color: 'var(--saffron)' }}>Verse {v.id}</b></nav>
      <div className="page-head">
        <div>
          <h1>Verse {v.id} · Review</h1>
          <div className="row"><span className="pill teal"><Icon name="lock" size={12} /> Canonical lock active</span>{updatedAt ? <span className="small muted">Synced {new Date(updatedAt).toLocaleString()}</span> : null}</div>
        </div>
        <a className="btn primary" href={strapiVerseLink()} target="_blank" rel="noreferrer"><Icon name="edit" /> Edit in Strapi ↗</a>
      </div>

      <div className="split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><span className="caps">Canonical sacred text</span><span className="pill mono" title={checksum ?? ''}>SHA-256 {checksum?.slice(0, 12)}…</span></div>
            <div className="canon verse" lang="sa">{v.sanskrit.map((l, i) => <div key={i}>{l}</div>)}</div>
            <p className="iast" style={{ fontSize: 14 }}>{v.iast}</p>
            <div className="lock"><Icon name="lock" /><span>The Sanskrit can't be changed here. In Strapi, a scholar must tick <b>sanskrit change approved</b>, otherwise the API refuses the new text.</span></div>
          </section>
          <section className="card">
            <span className="caps">Mobile preview</span>
            <div className="phone" style={{ marginTop: 12 }} aria-label="How the verse looks in the app">
              <span className="pill saffron" style={{ width: 'fit-content' }}>BHAGAVAD GITA {v.id}</span>
              <div className="card verse" style={{ fontSize: 16, textAlign: 'center' }}>{v.sanskrit.map((l, i) => <div key={i}>{l}</div>)}</div>
              <div className="card"><span className="caps">Meaning</span><p style={{ margin: '6px 0 0', fontSize: 14 }}>{v.meaning}</p></div>
              <div className="card" style={{ background: 'var(--teal-tint)' }}><span className="caps">Try today</span><p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 600 }}>{v.actions[0]}</p></div>
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <div style={{ padding: '16px 18px 4px' }}><h2>Word-by-word meaning (Pada-artha)</h2><p className="small muted">{v.words.length} words mapped</p></div>
            <table>
              <thead><tr><th className="caps">Sanskrit word</th><th className="caps">IAST</th><th className="caps">Meaning</th></tr></thead>
              <tbody>
                {v.words.length === 0 ? <tr><td colSpan={3} className="empty">No word meanings yet — add them in Strapi.</td></tr> :
                  v.words.map(([w, t, m], i) => <tr key={i}><td className="verse" style={{ fontSize: 16 }}>{w}</td><td className="iast" style={{ fontSize: 13 }}>{t}</td><td>{m}</td></tr>)}
              </tbody>
            </table>
          </section>
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2>Meaning &amp; life note</h2>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{v.meaning}</p>
            <div className="quote">{v.lifeNote}</div>
          </section>
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2>Daily actions</h2>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>{v.actions.map((a, i) => <li key={i}>{a}</li>)}</ol>
            <span className="caps" style={{ marginTop: 6 }}>Themes · used by Ask the Gita to find this verse</span>
            <div className="row">{v.themes.map((t) => <span key={t} className="pill teal">#{t}</span>)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
