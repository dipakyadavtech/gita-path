// W3 · AI guidance review — answers learners reported, and the guardrails that are always on.
import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ErrorBox, Loading } from '../components/States';
import { adminApi, type Flag, type Stats } from '../lib/api';
import { useAsync } from '../lib/useAsync';

type Tab = 'open' | 'resolved' | 'all';

// The rules the API applies to every answer (services/api guide module). Shown so reviewers know what is automatic.
const GUARDRAILS = [
  { id: 'Crisis intercept', text: 'Messages about self-harm or hopelessness (English and Hindi) get a fixed safety reply with helplines. No AI text is generated.', where: 'Checked on the phone first, then on the server' },
  { id: 'Quote verification', text: 'Any Sanskrit line in an answer must match a real verse in the corpus. Invented quotes are removed before the answer is sent.', where: 'Every answer' },
  { id: 'Cite known verses only', text: 'Answers can only cite verse numbers that exist in the live content library.', where: 'Every answer' },
  { id: 'Daily free limit', text: 'Free accounts get 5 questions a day; Plus has no limit.', where: 'Per learner, per day' },
  { id: 'Not professional advice', text: 'The app shows a reminder under every conversation that guidance is from scripture, not medical, legal or financial advice.', where: 'Ask screen' },
];

export function AiReview() {
  const [tab, setTab] = useState<Tab>('open');
  // Shared with the sidebar badge, so resolving a report updates both.
  const stats = useOutletContext<{ data?: Stats; reload: () => void }>();
  const flags = useAsync(() => adminApi.flags(tab), [tab]);
  const s = stats.data;

  const done = () => {
    flags.reload();
    stats.reload();
  };

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <span className="pill">Guidance review</span>
          <h1>AI Guidance Review &amp; Guardrails</h1>
          <p className="muted" style={{ margin: 0 }}>Answers that learners reported from the Ask tab. Check each against the verses it cites, then confirm the problem or dismiss the report.</p>
        </div>
      </div>

      <section className="grid4" aria-label="Summary">
        <div className="card stat"><span className="caps">Flagged for review</span><div className="num saffron">{s?.openFlags ?? '–'}</div><span className="small muted">waiting in the queue</span></div>
        <div className="card stat"><span className="caps">Resolved this week</span><div className="num teal">{s?.resolvedFlagsThisWeek ?? '–'}</div><span className="small muted">by reviewers</span></div>
        <div className="card stat"><span className="caps">Questions this week</span><div className="num indigo">{s?.questionsThisWeek ?? '–'}</div><span className="small muted">all learners</span></div>
        <div className="card stat"><span className="caps">Crisis replies this week</span><div className="num" style={{ color: 'var(--danger)' }}>{s?.crisisRepliesThisWeek ?? '–'}</div><span className="small muted">helpline shown, no AI text</span></div>
      </section>

      <div className="layout-aside">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="tabs" role="tablist" aria-label="Queue">
            {(['open', 'resolved', 'all'] as Tab[]).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'open' ? `Open (${s?.openFlags ?? 0})` : t === 'resolved' ? 'Resolved' : 'All reports'}
              </button>
            ))}
          </div>
          {flags.loading ? <Loading /> : flags.error ? <ErrorBox message={flags.error} retry={flags.reload} /> :
            flags.data!.length === 0 ? (
              <div className="card empty"><Icon name="check" size={28} /><p>{tab === 'open' ? 'Nothing to review. Reported answers will appear here.' : 'No reports yet.'}</p></div>
            ) : flags.data!.map((f) => <FlagCard key={f.id} flag={f} onDone={done} />)}
        </section>

        <aside className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} aria-label="Active guardrails">
          <div className="row" style={{ justifyContent: 'space-between' }}><h2>Active guardrails</h2><span className="pill ok">Always on</span></div>
          {GUARDRAILS.map((g) => (
            <div key={g.id} className="rule">
              <b>{g.id}</b>
              <span className="muted">{g.text}</span>
              <span className="small" style={{ color: 'var(--teal)' }}>{g.where}</span>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}

function FlagCard({ flag: f, onDone }: { flag: Flag; onDone: () => void }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  let cited: string[] = [];
  try {
    cited = JSON.parse(f.cited || '[]');
  } catch {
    cited = [];
  }

  const resolve = async (action: 'dismissed' | 'confirmed') => {
    setBusy(true);
    setError('');
    try {
      await adminApi.resolve(f.id, action, note);
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          <span className={f.reviewed ? 'pill ok' : 'pill danger'}><Icon name="flag" size={12} /> {f.reviewed ? (f.review_action === 'confirmed' ? 'Problem confirmed' : 'Dismissed') : 'Reported'}</span>
          {f.flag_reason ? <span className="small"><b>Reason:</b> {f.flag_reason}</span> : null}
        </div>
        <span className="small muted mono">ID {f.id.slice(0, 8)} · {new Date(f.created_at).toLocaleString()}</span>
      </div>
      <div><span className="caps">Learner's question</span><div className="quote" style={{ marginTop: 6 }}>“{f.question}”</div></div>
      <div><span className="caps">Answer given</span><div className="quote answer" style={{ marginTop: 6 }}>{f.answer ?? '(safety reply — no AI text)'}</div></div>
      {cited.length ? (
        <div className="row"><span className="caps">Cited</span>{cited.map((c) => <Link key={c} className="pill saffron" to={`/verses/${c}`}>BG {c}</Link>)}</div>
      ) : null}
      {f.reviewed ? (
        <p className="small muted" style={{ margin: 0 }}>Reviewed by {f.reviewed_by} on {f.reviewed_at ? new Date(f.reviewed_at).toLocaleString() : '—'}{f.review_note ? ` — “${f.review_note}”` : ''}</p>
      ) : (
        <>
          <label>Reviewer note (optional)<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Should cite 2.47 instead of 2.14" /></label>
          {error ? <p className="error" role="alert">{error}</p> : null}
          <div className="row">
            <button className="btn primary" disabled={busy} onClick={() => resolve('confirmed')}>Confirm problem</button>
            <button className="btn" disabled={busy} onClick={() => resolve('dismissed')}>Dismiss report</button>
          </div>
        </>
      )}
    </article>
  );
}
