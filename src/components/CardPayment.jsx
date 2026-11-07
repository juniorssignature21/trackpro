import { useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { money } from '../lib/format';

// One Stripe.js instance per publishable key (loadStripe injects https://js.stripe.com/v3 once).
const instances = {};
const stripeFor = key => (instances[key] ||= loadStripe(key));

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1d1d1f', colorText: '#1d1d1f', colorDanger: '#d93025',
    fontFamily: 'Archivo, Arial, sans-serif', borderRadius: '0px', spacingUnit: '4px',
  },
  rules: { '.Input': { border: '2px solid #1d1d1f', boxShadow: 'none' }, '.Input:focus': { boxShadow: '0 0 0 3px #ffcc00' } },
};
const fonts = [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&display=swap' }];

function PayForm({ reference, amount, currency, billing, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pay = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true); setError('');
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // 3-D Secure opens in a pop-up on this page; only a few bank methods ever redirect
      confirmParams: {
        return_url: `${window.location.origin}/book/confirm?reference=${encodeURIComponent(reference)}`,
        ...(billing ? { payment_method_data: { billing_details: billing } } : {}),
      },
    });
    if (err) {
      setError(err.message || 'The payment could not be completed.');
      setBusy(false);
      return;
    }
    onPaid(paymentIntent?.status);
  };

  return (
    <form onSubmit={pay} noValidate>
      <PaymentElement onReady={() => setReady(true)}
        options={{ layout: 'tabs', ...(billing ? { fields: { billingDetails: { name: 'never', email: 'never', phone: 'never' } } } : {}) }} />
      {error && <div className="alert alert-danger small mt-3 mb-0" role="alert">{error}</div>}
      <button className="btn btn-tp w-100 mt-4 btn-pill" disabled={!stripe || !ready || busy}>
        {busy ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</> : <><i className="bi bi-lock-fill me-2" />Pay {money(amount, currency)}</>}
      </button>
    </form>
  );
}

/**
 * Card form shown on our own page (Stripe Payment Element). Card details go straight from the iframe to Stripe.
 * `payment` = {reference, client_secret, publishable_key, amount}. `onPaid(status)` runs after the card is confirmed;
 * the server still verifies the payment before booking.
 */
export default function CardPayment({ payment, currency, billing, onPaid }) {
  const stripePromise = useMemo(() => stripeFor(payment.publishable_key), [payment.publishable_key]);
  const options = useMemo(() => ({ clientSecret: payment.client_secret, appearance, fonts, loader: 'auto' }), [payment.client_secret]);
  return (
    <Elements stripe={stripePromise} options={options} key={payment.client_secret}>
      <PayForm reference={payment.reference} amount={payment.amount} currency={currency} billing={billing} onPaid={onPaid} />
    </Elements>
  );
}
