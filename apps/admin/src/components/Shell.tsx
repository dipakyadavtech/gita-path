import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminApi, CMS_URL } from '../lib/api';
import { useStaff } from '../lib/auth';
import { useAsync } from '../lib/useAsync';
import { Icon } from './Icon';

export function Shell() {
  const { staff, signOut } = useStaff();
  const stats = useAsync(() => adminApi.stats(), []);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const open = stats.data?.openFlags ?? 0;

  return (
    <div className="shell">
      <nav className="side" aria-label="Studio">
        <div className="brand"><img src="/favicon.svg" alt="" width={34} height={34} /><div><b>Gita Path</b><small>STUDIO</small></div></div>
        <span className="caps">Sanctuary core</span>
        <NavLink to="/content" className="nav"><Icon name="library" /> Content Library</NavLink>
        <NavLink to="/ai" className="nav"><Icon name="shield" /> AI Guardrails {open ? <span className="count" aria-label={`${open} open flags`}>{open}</span> : null}</NavLink>
        <a href={`${CMS_URL}/admin`} target="_blank" rel="noreferrer" className="nav"><Icon name="edit" /> Edit content in Strapi ↗</a>
        <div className="side-foot">
          <div className="caps" style={{ padding: 0 }}>{stats.data ? `${stats.data.versesLive} verses live` : 'Verses live'}</div>
          <p className="muted" style={{ margin: '6px 0 0' }}>Sanskrit is locked by checksum. Changes need a scholar's approval in Strapi.</p>
        </div>
      </nav>
      <div className="main">
        <header className="top">
          <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/content?q=${encodeURIComponent(q)}`); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search verses by number, Sanskrit or meaning…" aria-label="Search verses" />
          </form>
          <div className="who">
            <div style={{ textAlign: 'right' }}><b>{staff?.name}</b><div className="muted small">Reviewer</div></div>
            <div className="avatar" aria-hidden>{staff?.name.slice(0, 1).toUpperCase()}</div>
            <button className="btn" onClick={signOut}>Sign out</button>
          </div>
        </header>
        <Outlet context={stats} />
      </div>
    </div>
  );
}
