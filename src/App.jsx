import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { I18nProvider } from './i18n';
import './portal/i18n-portal';        // side-effect: merge portal keys into I18N
import { StoreProvider } from './store';
import Toast from './Toast';

import PortalHome from './portal/Home';
import PortalSearch from './portal/Search';
import PortalDetail from './portal/Detail';
import PortalFinance from './portal/Finance';
import PortalAI from './portal/AIConsultant';
import PortalAdvertise from './portal/Advertise';
import PortalAuth from './portal/Auth';
import PortalAdmin from './portal/Admin';

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

/* Detail needs the listing from route state; on a direct URL / refresh it
   falls back to the demo set, then to the API for DB listings. */
import { useLocation, useParams } from 'react-router-dom';
import { PLISTINGS, mapApiListing } from './portal/shared';
import { api } from './api/client';
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
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted, #667)', fontFamily: 'var(--sans, sans-serif)', fontSize: 14 }}>
        Memuat listing…
      </div>
    );
  }
  return <Detail {...props} listing={listing} />;
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
          <Route path="/admin/*" element={<Admin {...props} />} />
          <Route path="*" element={<Home {...props} />} />
        </Routes>
        <Toast />
      </StoreProvider>
    </I18nProvider>
  );
}
