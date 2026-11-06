import { useEffect, useRef, useState } from 'react';
import { api } from './api';

// Prices always come from the API (/api/quote/calculate) – the server owns the rate cards and surcharges.

export const DRAFT_KEY = 'vdc_booking_draft';

export const blankShipment = (home = 'US') => ({
  origin_country: home, origin: '', dest_country: home, destination: '',
  is_document: false, pieces: '1', weight: '1', length: '30', width: '20', height: '15',
  insured_value: '', signature: false, duties_paid: false, product: 'Express',
});

/** Form state -> API payload */
export const toQuoteBody = f => ({
  origin_country: f.origin_country, dest_country: f.dest_country, origin: f.origin, destination: f.destination,
  is_document: !!f.is_document, pieces: Math.max(parseInt(f.pieces, 10) || 1, 1),
  weight_kg: +f.weight || 0, length_cm: +f.length || 0, width_cm: +f.width || 0, height_cm: +f.height || 0,
  insured_value: +f.insured_value || 0, signature: !!f.signature, duties_paid: !!f.duties_paid,
  ...(f.ship_date ? { ship_date: f.ship_date } : {}),
});

/** Debounced live quote. Returns { quote, error, loading }. */
export function useLiveQuote(f, delay = 350) {
  const [state, setState] = useState({ quote: null, error: '', loading: true });
  const seq = useRef(0);
  const body = JSON.stringify(toQuoteBody(f));
  useEffect(() => {
    const n = ++seq.current;
    setState(s => ({ ...s, loading: true }));
    const t = setTimeout(() => {
      api.calcQuote(JSON.parse(body))
        .then(quote => { if (n === seq.current) setState({ quote, error: '', loading: false }); })
        .catch(err => { if (n === seq.current) setState({ quote: null, error: err.message, loading: false }); });
    }, delay);
    return () => clearTimeout(t);
  }, [body, delay]);
  return state;
}

export const saveDraft = d => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* private mode */ } };
export const loadDraft = () => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)); } catch { return null; } };
