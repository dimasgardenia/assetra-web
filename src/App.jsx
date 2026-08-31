import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { I18nProvider } from './i18n';
import './portal/i18n-portal';        // side-effect: merge portal keys into I18N
import { StoreProvider } from './store';
import Toast from './Toast';
import { GlobalLoadingBar } from './portal/Loading';

import PortalHome from './portal/Home';
import PortalSearch from './portal/Search';
import PortalDetail from './portal/Detail';
import PortalFinance from './portal/Finance';
import PortalAI from './portal/AIConsultant';
import PortalAdvertise from './portal/Advertise';
import PortalAuth from './portal/Auth';
import PortalAdmin from './portal/Admin';
import PortalSettings from './portal/Settings';

/* Maps the design's onNav(id) convention onto React Router paths. */
const NAV_MAP = {
  home: '/',
  buy: '/search',
  rent: '/search?mode=rent',
  new: '/search?mode=new',
  search: '/search',
  detail: '/listing',
  finance: '/finance',
  ai: '/ai',
  advertise: '/advertise',
  signin: '/auth',
  sell: '/auth',
  admin: '/admin',
  settings: '/settings',
};

function withNav(Component) {
  return function Wrapped(props) {
    const navigate = useNavigate();
    const onNav = (id, payload) => {
      if (id === 'detail' && payload?.id != null) {
        navigate(`/listing/${payload.id}`, { state: { listing: payload } });
        return;
      }
      if (id === 'search' && payload && typeof payload === 'object') {
        const qs = new URLSearchParams(
          Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== '' && v != null)),
        ).toString();
        navigate(qs ? `/search?${qs}` : '/search');
        return;
      }
      navigate(NAV_MAP[id] || '/');
    };
    return <Component {...props} onNav={onNav} />;
  };
}

const Home = withNav(PortalHome);
const Search = withNav(PortalSearch);
const Detail = withNav(PortalDetail);
const Finance = withNav(PortalFinance);
const AI = withNav(PortalAI);
const Advertise = withNav(PortalAdvertise);
const Auth = withNav(PortalAuth);
const Admin = withNav(PortalAdmin);
const Settings = withNav(PortalSettings);

/* Detail needs the listing from route state; on a direct URL / refresh it
   falls back to the demo set, then to the API for DB listings. */
import { useLocation, useParams } from 'react-router-dom';
import { PLISTINGS, mapApiListing } from './portal/shared';
import { api } from './api/client';
import { Spinner } from './portal/Loading';
function DetailRoute(props) {
  const { state } = useLocation();
  const { id } = useParams();
  const known = state?.listing || PLISTINGS.find(l => String(l.id) === String(id)) || null;
  const [fetched, setFetched] = React.useState(null);
  React.useEffect(() => {
    if (known || !id) return;
    let on = true;
    api.get(`/api/listings/${encodeURIComponent(id)}`)
      .then(r => { if (on && r?.data) setFetched(mapApiListing(r.data)); })
      .catch(() => {});
    return () => { on = false; };
  }, [id]);
  const listing = known || fetched;
  if (!listing) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', color: 'var(--muted, #667)', fontFamily: 'var(--sans, sans-serif)', fontSize: 14 }}>
        <Spinner size={30} />
        Memuat listing…
      </div>
    );
  }
  return <Detail {...props} listing={listing} />;
}

/* Penjaga /admin — hanya admin ATAU agen terverifikasi (kartu 'live'). */
import { useUser, useAuthReady } from './store';
function AdminGuard(props) {
  const user = useUser();
  const authReady = useAuthReady();
  const [state, setState] = React.useState('checking'); // checking | allowed | denied
  React.useEffect(() => {
    if (!authReady) return;
    if (!user) { setState('denied'); return; }
    if (user.role === 'admin') { setState('allowed'); return; }
    if (user.accountType === 'agent' && user.emailVerified) {
      let on = true;
      api.get('/api/agents/me')
        .then(r => { if (on) setState(r.data?.status === 'live' ? 'allowed' : 'denied'); })
        .catch(() => { if (on) setState('denied'); });
      return () => { on = false; };
    }
    setState('denied');
  }, [authReady, user]);

  if (!authReady || state === 'checking') {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={30} /></div>;
  }
  if (state === 'denied') {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontFamily: 'var(--sans, sans-serif)' }}>
        <div style={{ fontFamily: 'var(--serif, Georgia)', fontSize: 26, color: 'var(--ink, #0A1640)' }}>Akses ditolak</div>
        <div style={{ color: 'var(--muted, #667)', fontSize: 14, maxWidth: 380, lineHeight: 1.6 }}>Panel admin hanya untuk admin atau agen terverifikasi. Silakan masuk dengan akun yang sesuai.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/" style={{ textDecoration: 'none' }}><button className="p-btn p-btn-ghost">Ke beranda</button></a>
          <a href="/auth" style={{ textDecoration: 'none' }}><button className="p-btn p-btn-cyan">Masuk</button></a>
        </div>
      </div>
    );
  }
  return <Admin {...props} />;
}

export default function App() {
  const [lang, setLang] = useState('id');
  const props = { lang, onLang: setLang };

  return (
    <I18nProvider lang={lang}>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Home {...props} />} />
          <Route path="/search" element={<Search {...props} />} />
          <Route path="/listing/:id?" element={<DetailRoute {...props} />} />
          <Route path="/finance" element={<Finance {...props} />} />
          <Route path="/ai" element={<AI {...props} />} />
          <Route path="/advertise" element={<Advertise {...props} />} />
          <Route path="/auth" element={<Auth {...props} />} />
          <Route path="/signin" element={<Auth {...props} />} />
          <Route path="/register" element={<Auth {...props} />} />
          <Route path="/settings" element={<Settings {...props} />} />
          <Route path="/admin/*" element={<AdminGuard {...props} />} />
          <Route path="*" element={<Home {...props} />} />
        </Routes>
        <Toast />
        <GlobalLoadingBar />
      </StoreProvider>
    </I18nProvider>
  );
}
