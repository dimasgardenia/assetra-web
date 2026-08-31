/* Central app store — now backed by Express+SQLite API.
   Local-only state: toast, page-level UI flags.
   Server-backed state: listings, bids, user (auth), watchlist, KYC. */
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { setToken as setApiToken, getToken } from './api/client.js';
import { authApi } from './api/auth.js';
import { listingsApi } from './api/listings.js';
import { watchlistApi } from './api/watchlist.js';

const initialState = {
  listings: [],                  // fetched from /api/listings
  listingsMeta: { page: 1, perPage: 9, total: 0, totalPages: 1 },
  listingsLoading: false,
  listingsError: null,
  filters: { q: '', type: 'all', region: 'any', verif_level: 'any' },

  bidsByListing: {},             // local cache; updated on place
  watchlist: [],                 // array of listing IDs
  user: null,                    // from /api/auth/me or login
  authReady: false,              // becomes true after initial me() call resolves
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'AUTH_READY':
      return { ...state, authReady: true, user: action.user || null };

    case 'LOGIN': {
      const user = action.user;
      const role = user?.role || 'bidder';
      return {
        ...state,
        user: { ...user, role },
        toast: {
          kind: 'success',
          text: role === 'admin'
            ? `Masuk sebagai admin · ${user.name || user.email}`
            : `Selamat datang, ${user.name || user.email}`,
        },
      };
    }

    case 'LOGOUT':
      return { ...state, user: null, watchlist: [], toast: { kind: 'info', text: 'Anda telah keluar' } };

    case 'LISTINGS_LOADING':
      return { ...state, listingsLoading: true, listingsError: null };

    case 'LISTINGS_SUCCESS':
      return {
        ...state,
        listings: action.data,
        listingsMeta: action.meta,
        listingsLoading: false,
        listingsError: null,
      };

    case 'LISTINGS_ERROR':
      return { ...state, listingsLoading: false, listingsError: action.error };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };

    case 'BIDS_CACHE':
      return { ...state, bidsByListing: { ...state.bidsByListing, [action.listingId]: action.bids } };

    case 'PLACE_BID_SUCCESS': {
      // Update the listing in the list with the latest current_bid + bid count.
      const listings = state.listings.map(l =>
        l.id === action.listing.id ? { ...l, ...action.listing } : l
      );
      const prev = state.bidsByListing[action.listing.id] || [];
      return {
        ...state,
        listings,
        bidsByListing: { ...state.bidsByListing, [action.listing.id]: [action.bid, ...prev] },
        toast: { kind: 'success', text: 'Tawaran berhasil dikirim · Verifikasi e-KTP terdeteksi' },
      };
    }

    case 'WATCHLIST_SET':
      return { ...state, watchlist: action.ids };

    case 'WATCHLIST_TOGGLE_LOCAL': {
      const exists = state.watchlist.includes(action.id);
      return {
        ...state,
        watchlist: exists ? state.watchlist.filter(x => x !== action.id) : [...state.watchlist, action.id],
        toast: { kind: 'info', text: exists ? 'Dihapus dari watchlist' : 'Disimpan ke watchlist' },
      };
    }

    case 'TOAST':
      return { ...state, toast: action.toast };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /** Restore session: if we have a token, fetch /me. Else mark authReady true. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getToken();
      if (!token) {
        if (!cancelled) dispatch({ type: 'AUTH_READY' });
        return;
      }
      try {
        const { user } = await authApi.me();
        if (!cancelled) dispatch({ type: 'AUTH_READY', user });
      } catch {
        setApiToken(null);
        if (!cancelled) dispatch({ type: 'AUTH_READY' });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** Toast auto-dismiss */
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500);
    return () => clearTimeout(t);
  }, [state.toast]);

  /** Fetch user's watchlist whenever they log in. */
  useEffect(() => {
    if (!state.user) return;
    let cancelled = false;
    watchlistApi.list().then(r => {
      if (cancelled) return;
      dispatch({ type: 'WATCHLIST_SET', ids: r.data.map(l => l.id) });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [state.user?.id]);

  /* Action helpers — exposed via context */
  const actions = {
    async login(email, password) {
      const { user, token } = await authApi.login(email, password);
      setApiToken(token);
      dispatch({ type: 'LOGIN', user });
      return user;
    },

    async register(input) {
      const resp = await authApi.register(input);
      /* Gerbang verifikasi email: belum ada sesi sampai tautan di email diklik. */
      if (resp?.pendingVerification) return resp;
      const { user, token } = resp;
      setApiToken(token);
      dispatch({ type: 'LOGIN', user });
      return user;
    },

    async googleLogin(profile) {
      const { user, token } = await authApi.googleSso(profile);
      setApiToken(token);
      dispatch({ type: 'LOGIN', user });
      return user;
    },

    logout() {
      setApiToken(null);
      dispatch({ type: 'LOGOUT' });
    },

    /** Perbarui objek user di state (mis. setelah ubah profil). */
    setUser(user) {
      if (user) dispatch({ type: 'LOGIN', user });
    },

    /** Ambil ulang /me dari server dan segarkan state user. */
    async refreshUser() {
      try {
        const { user } = await authApi.me();
        dispatch({ type: 'LOGIN', user });
        return user;
      } catch { return null; }
    },

    async fetchListings(filters = {}, page = 1, perPage = 9) {
      dispatch({ type: 'LISTINGS_LOADING' });
      try {
        const { data, meta } = await listingsApi.list({ ...filters, page, per_page: perPage });
        dispatch({ type: 'LISTINGS_SUCCESS', data, meta });
        return { data, meta };
      } catch (e) {
        dispatch({ type: 'LISTINGS_ERROR', error: e.message });
        throw e;
      }
    },

    async placeBid(listingId, amount) {
      const { data: bid, listing } = await listingsApi.placeBid(listingId, amount);
      dispatch({ type: 'PLACE_BID_SUCCESS', bid: { ...bid, you: true, verified: bid.verified }, listing });
      return bid;
    },

    async loadBids(listingId) {
      const { data } = await listingsApi.listBids(listingId);
      dispatch({ type: 'BIDS_CACHE', listingId, bids: data });
      return data;
    },

    async toggleWatchlist(id) {
      const exists = state.watchlist.includes(id);
      // Optimistic update
      dispatch({ type: 'WATCHLIST_TOGGLE_LOCAL', id });
      try {
        if (exists) await watchlistApi.remove(id);
        else await watchlistApi.add(id);
      } catch (e) {
        // Rollback
        dispatch({ type: 'WATCHLIST_TOGGLE_LOCAL', id });
        dispatch({ type: 'TOAST', toast: { kind: 'error', text: e.message } });
      }
    },

    setFilters(filters) {
      dispatch({ type: 'SET_FILTERS', filters });
    },

    showToast(kind, text) {
      dispatch({ type: 'TOAST', toast: { kind, text } });
    },
  };

  return (
    <StoreCtx.Provider value={{ state, dispatch, actions }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useActions() { return useStore().actions; }
export function useListings() { return useStore().state.listings; }
export function useListingsMeta() { return useStore().state.listingsMeta; }
export function useListingsLoading() { return useStore().state.listingsLoading; }
export function useUser() { return useStore().state.user; }
export function useAuthReady() { return useStore().state.authReady; }
export function useRole() { return useStore().state.user?.role || null; }
export function useIsAdmin() { return useStore().state.user?.role === 'admin'; }
export function useWatchlist() { return useStore().state.watchlist; }
export function useBids(listingId) {
  return useStore().state.bidsByListing[listingId] || [];
}
