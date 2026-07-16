/* Admin shell — sidebar, topbar, page wrappers, dashboard, listings table */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { Logo2, LangSwitch, Photo2, fmtIDR, fmtIDRShort } from '../../shared-v2';
import { useListings, useActions, useUser } from '../../store';

const AdmIcon = ({ name, size = 16, stroke = 1.6 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'dash':
      return <svg {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case 'list':
      return <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
    case 'plus':
      return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'upload':
      return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
    case 'gavel':
      return <svg {...p}><path d="M14.5 4.5L9 10l-3-3 5.5-5.5"/><path d="M16 8L20 12"/><path d="M11 13L19 21"/><path d="M3 21h8"/></svg>;
    case 'users':
      return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'doc':
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'log':
      return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'bell':
      return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'export':
      return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'edit':
      return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':
      return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>;
    case 'eye':
      return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'check':
      return <svg {...p} strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>;
    case 'x':
      return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'cloud':
      return <svg {...p}><path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><path d="M16 16l-4-4-4 4"/></svg>;
    case 'file-csv':
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="6" y="18" fontFamily="monospace" fontSize="6" fill="currentColor" stroke="none">CSV</text></svg>;
    case 'pin':
      return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'shield':
      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'arrowR':
      return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'menu':
      return <svg {...p}><circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/></svg>;
    default: return null;
  }
};

const SidebarLink = ({ icon, label, active, count, onClick }) => (
  <div className={`adm-sidebar-link ${active ? 'active' : ''}`} onClick={onClick}>
    <AdmIcon name={icon} size={16} />
    <span>{label}</span>
    {count != null ? <span className="adm-count">{count}</span> : null}
  </div>
);

const AdmSidebar = ({ active = 'dashboard', onChange = () => {} }) => {
  const { t } = useT();
  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-brand">
        <img src="assets/assetra-logo.png" alt="Assetra" />
        <span className="adm-sidebar-tag">ADMIN</span>
      </div>

      <div className="adm-sidebar-section">{t('adm.section.main')}</div>
      <SidebarLink icon="dash" label={t('adm.nav.dashboard')} active={active === 'dashboard'} onClick={() => onChange('dashboard')} />
      <SidebarLink icon="list" label={t('adm.nav.listings')} active={active === 'listings'} count={142} onClick={() => onChange('listings')} />
      <SidebarLink icon="plus" label={t('adm.nav.newListing')} active={active === 'new'} onClick={() => onChange('new')} />
      <SidebarLink icon="upload" label={t('adm.nav.bulk')} active={active === 'bulk'} onClick={() => onChange('bulk')} />
      <SidebarLink icon="gavel" label={t('adm.nav.auctions')} active={active === 'auctions'} count={6} onClick={() => onChange('auctions')} />

      <div className="adm-sidebar-section">{t('adm.section.review')}</div>
      <SidebarLink icon="users" label={t('adm.nav.bidders')} active={active === 'bidders'} count={23} onClick={() => onChange('bidders')} />
      <SidebarLink icon="doc" label={t('adm.nav.documents')} active={active === 'documents'} onClick={() => onChange('documents')} />
      <SidebarLink icon="log" label={t('adm.nav.audit')} active={active === 'audit'} onClick={() => onChange('audit')} />

      <div className="adm-sidebar-section">{t('adm.section.system')}</div>
      <SidebarLink icon="settings" label={t('adm.nav.settings')} active={active === 'settings'} onClick={() => onChange('settings')} />

      <div className="adm-sidebar-user">
        <div className="adm-sidebar-avatar">RA</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--paper)' }}>Rina Aditya</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(250,250,247,0.5)', letterSpacing: '0.06em' }}>SUPER ADMIN · KEMENKEU</div>
        </div>
      </div>
    </aside>
  );
};

const AdmTopbar = ({ crumb, lang, onLang, actions }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const storeActions = useActions();
  const user = useUser();
  return (
    <div className="adm-topbar">
      <div className="adm-topbar-crumb">
        {crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <span style={{ color: 'var(--line)' }}>/</span> : null}
            {i === crumb.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="adm-topbar-search">
        <AdmIcon name="search" size={14} />
        <input placeholder={t('adm.search.placeholder')} />
        <kbd>⌘K</kbd>
      </div>
      <div className="adm-topbar-actions">
        {onLang && <LangSwitch lang={lang} onChange={onLang} />}
        <button className="adm-topbar-btn">
          <AdmIcon name="bell" size={14} />
        </button>
        {actions}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, marginLeft: 4, borderLeft: '1px solid var(--line)' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 11 }}>
              {(user.name || user.email).slice(0,2).toUpperCase()}
            </span>
            <div style={{ fontSize: 11, lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600 }}>{(user.name || user.email).split(' ')[0]}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold-2)', letterSpacing: '0.08em' }}>ADMIN</div>
            </div>
            <button onClick={() => { storeActions.logout(); navigate('/'); }} className="adm-topbar-btn" title="Sign out" style={{ marginLeft: 4 }}>
              <AdmIcon name="x" size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdmShell = ({ active, onChange, lang, onLang, crumb, title, sub, headActions, children }) => (
  <div className="adm-shell">
    <AdmSidebar active={active} onChange={onChange} />
    <div className="adm-main">
      <AdmTopbar crumb={crumb} lang={lang} onLang={onLang} />
      <div className="adm-page">
        <div className="adm-page-head">
          <div>
            <h1 className="adm-page-title">{title}</h1>
            <div className="adm-page-sub">{sub}</div>
          </div>
          {headActions ? <div className="adm-page-actions">{headActions}</div> : null}
        </div>
        {children}
      </div>
    </div>
  </div>
);

/* ─────────── Dashboard ─────────── */

const Sparkline = ({ data, color = 'var(--gold)' }) => {
  const w = 80, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="adm-kpi-spark">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

const AdmDashboard = ({ lang, onLang, onChange }) => {
  const { t } = useT();
  return (
    <AdmShell
      active="dashboard" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.nav.dashboard')]}
      title={t('adm.dash.title')}
      sub={t('adm.dash.sub')}
      headActions={
        <>
          <button className="adm-topbar-btn"><AdmIcon name="export" size={13} /> {t('adm.btn.export')}</button>
          <button className="adm-topbar-btn primary" onClick={() => onChange('new')}><AdmIcon name="plus" size={13} /> {t('adm.btn.newListing')}</button>
        </>
      }
    >
      {/* KPI grid */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.kpi.activeAuctions')}</div>
          <div className="adm-kpi-val">142</div>
          <div className="adm-kpi-delta up">▲ 8 this week</div>
          <Sparkline data={[120,124,128,131,135,138,142]} />
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.kpi.totalGmv')}</div>
          <div className="adm-kpi-val">Rp 847<small>B</small></div>
          <div className="adm-kpi-delta up">▲ 12.4% MoM</div>
          <Sparkline data={[450,520,580,640,710,780,847]} color="var(--green)" />
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.kpi.pendingKyc')}</div>
          <div className="adm-kpi-val">23</div>
          <div className="adm-kpi-delta down">▲ 6 since yesterday</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.kpi.disputeRate')}</div>
          <div className="adm-kpi-val">0.4<small>%</small></div>
          <div className="adm-kpi-delta up">▼ 0.2pp QoQ</div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        {/* Recent activity */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">{t('adm.dash.recent')}</h3>
            <span className="adm-card-subtitle">LAST 24H · 47 EVENTS</span>
          </div>
          <table className="adm-table">
            <thead>
              <tr><th>Time</th><th>Actor</th><th>Action</th><th>Asset</th><th>Result</th></tr>
            </thead>
            <tbody>
              {[
                { time: '14:32', actor: 'Bidder #B-0042', action: 'Placed bid · Rp 8.75 M', asset: 'AST·2026·0847', result: 'success' },
                { time: '14:28', actor: 'Admin · Rina A.', action: 'Approved KYC', asset: 'B-0089', result: 'success' },
                { time: '14:11', actor: 'PT Wijaya Estate', action: 'Submitted listing', asset: 'AST·2026·0858', result: 'review' },
                { time: '13:55', actor: 'Bidder #B-0089', action: 'Deposit confirmed · Rp 875 jt', asset: 'AST·2026·0847', result: 'success' },
                { time: '13:42', actor: 'System', action: 'Anti-snipe extension +2 min', asset: 'AST·2026·0823', result: 'auto' },
                { time: '13:30', actor: 'Notary · H. Surya', action: 'Verified BPN documents', asset: 'AST·2026·0801', result: 'success' },
                { time: '13:18', actor: 'Bidder #B-0017', action: 'Withdrawn bid', asset: 'AST·2026·0795', result: 'reject' },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="num" style={{ color: 'var(--muted)' }}>{r.time}</td>
                  <td><span style={{ fontWeight: 500 }}>{r.actor}</span></td>
                  <td>{r.action}</td>
                  <td className="id-col">{r.asset}</td>
                  <td>
                    {r.result === 'success' && <span className="adm-pill verified">✓ Done</span>}
                    {r.result === 'review' && <span className="adm-pill pending">⊙ Review</span>}
                    {r.result === 'auto' && <span className="adm-pill">∞ Auto</span>}
                    {r.result === 'reject' && <span className="adm-pill rejected">✕ Withdrawn</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Needs attention */}
        <div className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">{t('adm.dash.attention')}</h3>
            <span className="adm-card-subtitle">5 ITEMS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: 'users', n: '23 bidders', sub: 'Pending KYC review · oldest 2d 14h', cta: 'Review →', color: 'var(--gold)' },
              { icon: 'doc', n: '4 documents', sub: 'Awaiting notary signature', cta: 'Open →', color: 'var(--ink-2)' },
              { icon: 'gavel', n: '2 auctions', sub: 'Closing in <1 hour · monitor live', cta: 'Watch →', color: 'var(--red)' },
              { icon: 'shield', n: 'AST·2026·0823', sub: 'Reserve not met · contact seller', cta: 'Contact →', color: 'var(--gold)' },
              { icon: 'cloud', n: 'Bulk import #4421', sub: '247 rows · 3 errors awaiting fix', cta: 'Resolve →', color: 'var(--ink-2)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px 22px', borderBottom: i < 4 ? '1px solid var(--line)' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, background: 'var(--paper-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                  <AdmIcon name={item.icon} size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.sub}</div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{item.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdmShell>
  );
};

/* ─────────── Listings table ─────────── */

const AdmListings = ({ lang, onLang, onChange }) => {
  const { t } = useT();
  const storeListings = useListings();
  const actions = useActions();

  // Fetch all listings (high per_page so admin sees everything in the table)
  React.useEffect(() => {
    actions.fetchListings({}, 1, 100).catch(() => {});
  }, []);
  const closes = (endDate) => {
    if (!endDate) return 'TBD';
    const d = new Date(endDate);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };
  const allListings = storeListings.map(l => ({
    id: l.id,
    title: l.title,
    type: l.typeLabel || l.type,
    region: l.region,
    start: l.startingBid,
    current: l.currentBid,
    bidders: l.bidders || 0,
    status: l.status === 'live' ? 'live' : l.status === 'soon' ? 'scheduled' : (l.status || 'draft'),
    closes: closes(l.endDate),
  }));

  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? allListings : allListings.filter(l => l.status === filter);

  return (
    <AdmShell
      active="listings" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.nav.listings')]}
      title={t('adm.list.title')}
      sub={t('adm.list.sub')}
      headActions={
        <>
          <button className="adm-topbar-btn"><AdmIcon name="export" size={13} /> {t('adm.btn.export')}</button>
          <button className="adm-topbar-btn" onClick={() => onChange('bulk')}><AdmIcon name="upload" size={13} /> {t('adm.btn.bulk')}</button>
          <button className="adm-topbar-btn primary" onClick={() => onChange('new')}><AdmIcon name="plus" size={13} /> {t('adm.btn.newListing')}</button>
        </>
      }
    >
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: -8 }}>
        {[
          { id: 'all', label: 'All', count: allListings.length },
          { id: 'live', label: t('adm.status.live'), count: allListings.filter(l => l.status === 'live').length },
          { id: 'scheduled', label: t('adm.status.scheduled'), count: allListings.filter(l => l.status === 'scheduled').length },
          { id: 'review', label: t('adm.status.review'), count: allListings.filter(l => l.status === 'review').length },
          { id: 'draft', label: t('adm.status.draft'), count: allListings.filter(l => l.status === 'draft').length },
          { id: 'closed', label: t('adm.status.closed'), count: allListings.filter(l => l.status === 'closed').length },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', border: '1px solid var(--line)', cursor: 'pointer',
            background: filter === f.id ? 'var(--ink)' : 'var(--paper)',
            color: filter === f.id ? 'var(--paper)' : 'var(--ink-2)',
            fontSize: 12, fontFamily: 'var(--sans)', borderRadius: 1,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {f.label} <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.65 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 130 }}>{t('adm.col.id')}</th>
              <th>{t('adm.col.title')}</th>
              <th>{t('adm.col.region')}</th>
              <th style={{ textAlign: 'right' }}>{t('adm.col.starting')}</th>
              <th style={{ textAlign: 'right' }}>{t('adm.col.current')}</th>
              <th style={{ textAlign: 'right' }}>{t('adm.col.bidders')}</th>
              <th>{t('adm.col.status')}</th>
              <th>{t('adm.col.closes')}</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id}>
                <td className="id-col">{l.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'var(--paper-2)', borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                      <Photo2 kind={l.type.toLowerCase().includes('land') || l.type.toLowerCase().includes('agricul') ? 'land' : l.type.toLowerCase().includes('commercial') || l.type.toLowerCase().includes('office') || l.type.toLowerCase().includes('industrial') ? 'commercial' : 'villa'} seed={l.id} w={200} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.type}</div>
                    </div>
                  </div>
                </td>
                <td>{l.region}</td>
                <td className="num" style={{ textAlign: 'right' }}>{fmtIDRShort(l.start)}</td>
                <td className="num" style={{ textAlign: 'right', fontWeight: l.status === 'live' ? 600 : 400, color: l.status === 'live' ? 'var(--ink)' : 'var(--muted)' }}>{l.current ? fmtIDRShort(l.current) : '—'}</td>
                <td className="num" style={{ textAlign: 'right' }}>{l.bidders || '—'}</td>
                <td>
                  <span className={`adm-pill ${l.status}`}>
                    {l.status === 'live' && t('adm.status.live')}
                    {l.status === 'scheduled' && t('adm.status.scheduled')}
                    {l.status === 'draft' && t('adm.status.draft')}
                    {l.status === 'review' && t('adm.status.review')}
                    {l.status === 'closed' && t('adm.status.closed')}
                  </span>
                </td>
                <td className="num" style={{ fontSize: 11, color: 'var(--muted)' }}>{l.closes}</td>
                <td>
                  <div className="row-actions">
                    <button style={{ background: 'transparent', border: '1px solid var(--line)', padding: 6, cursor: 'pointer', color: 'var(--ink-2)' }}><AdmIcon name="eye" size={13} /></button>
                    <button style={{ background: 'transparent', border: '1px solid var(--line)', padding: 6, cursor: 'pointer', color: 'var(--ink-2)' }}><AdmIcon name="edit" size={13} /></button>
                    <button style={{ background: 'transparent', border: '1px solid var(--line)', padding: 6, cursor: 'pointer', color: 'var(--red)' }}><AdmIcon name="trash" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
        <span>Showing {filtered.length} of 142 · Page 1/15</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="adm-topbar-btn" style={{ padding: '5px 12px' }}>← Prev</button>
          <button className="adm-topbar-btn" style={{ padding: '5px 12px' }}>Next →</button>
        </div>
      </div>
    </AdmShell>
  );
};

export { AdmIcon, AdmShell, AdmSidebar, AdmTopbar, AdmDashboard, AdmListings };
