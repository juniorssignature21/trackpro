import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import { Alert } from '../components/Bits';
import { useBodyClass, useTitle } from '../lib/hooks';

export default function Login() {
  useTitle('Admin sign in');
  useBodyClass('adm');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={loc.state?.from || '/admin'} replace />;

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(f.email, f.password);
      navigate(loc.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm adm-login">
      <form className="box" onSubmit={submit}>
        <img src="/branding/logo_931a74e398.png" alt="TrackPro" style={{ height: 46 }} className="mb-4" />
        <h1 className="h3 fw-bold mb-1">Admin sign in</h1>
        <p className="text-muted mb-4">Manage shipments, tracking updates and receipts.</p>
        <Alert onClose={() => setError('')}>{error}</Alert>
        <div className="mb-3"><label className="form-label" htmlFor="le">Email</label>
          <input id="le" type="email" className="form-control" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required autoFocus autoComplete="username" /></div>
        <div className="mb-4"><label className="form-label" htmlFor="lp">Password</label>
          <input id="lp" type="password" className="form-control" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required autoComplete="current-password" /></div>
        <button className="btn btn-tp-dark w-100 py-3" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : 'Sign in'}</button>
        <Link to="/" className="d-block text-center mt-3 small text-muted">← Back to website</Link>
      </form>
    </div>
  );
}
