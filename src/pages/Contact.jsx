import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Bits';
import { api } from '../lib/api';
import { useTitle } from '../lib/hooks';
import { useSettings } from '../lib/settings';

export default function Contact() {
  useTitle('Contact');
  const s = useSettings();
  const [params] = useSearchParams();
  const empty = { name: '', email: '', subject: params.get('subject') || '', message: '' };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await api.contact(f);
      setMsg({ kind: 'success', text: res.message });
      setF({ ...empty, subject: '' });
    } catch (err) {
      setMsg({ kind: 'danger', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="tp-page-hero">
        <div className="container"><nav className="breadcrumb mb-2"><Link to="/">Home</Link>&nbsp;/&nbsp;Contact</nav><h1>Say<br />hello</h1></div>
      </section>
      <section className="section">
        <div className="container"><div className="row g-4">
          <div className="col-lg-4">
            <a href={`tel:${s.company_phone}`} className="sheet-card d-flex gap-3 align-items-center text-decoration-none" style={{ background: 'var(--tp-yellow)' }}>
              <span className="round-btn" style={{ background: 'var(--tp-ink)', color: '#fff' }}><i className="bi bi-telephone-fill" /></span>
              <div><small className="text-muted">Call us</small><div className="fw-bold">{s.company_phone}</div></div>
            </a>
            <a href={`mailto:${s.company_email}`} className="sheet-card d-flex gap-3 align-items-center text-decoration-none" style={{ background: 'var(--tp-lime)' }}>
              <span className="round-btn" style={{ background: 'var(--tp-ink)', color: '#fff' }}><i className="bi bi-envelope-fill" /></span>
              <div><small className="text-muted">Email</small><div className="fw-bold text-break">{s.company_email}</div></div>
            </a>
            <div className="sheet-card d-flex gap-3 align-items-center" style={{ background: '#fff' }}>
              <span className="round-btn" style={{ background: 'var(--tp-ink)', color: '#fff' }}><i className="bi bi-geo-alt-fill" /></span>
              <div><small className="text-muted">Head office</small><div className="fw-bold">{s.company_address}</div></div>
            </div>
            <div className="sheet-card dark"><b>Support hours</b><p className="mb-0 small opacity-75">Chat &amp; phone: 24/7<br />Sales: Mon–Fri, 8:00–18:00</p></div>
          </div>
          <div className="col-lg-8">
            <div className="tp-card">
              {msg && <Alert kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Alert>}
              <form className="row g-3" onSubmit={submit}>
                <div className="col-md-6"><label className="form-label" htmlFor="cname">Name</label><input id="cname" value={f.name} onChange={set('name')} className="form-control tp-input" required minLength={2} autoComplete="name" /></div>
                <div className="col-md-6"><label className="form-label" htmlFor="cemail">Email</label><input id="cemail" type="email" value={f.email} onChange={set('email')} className="form-control tp-input" required autoComplete="email" /></div>
                <div className="col-12"><label className="form-label" htmlFor="csubject">Subject</label><input id="csubject" value={f.subject} onChange={set('subject')} className="form-control tp-input" /></div>
                <div className="col-12"><label className="form-label" htmlFor="cmsg">Message</label><textarea id="cmsg" rows="5" value={f.message} onChange={set('message')} className="form-control tp-input" required minLength={5} /></div>
                <div className="col-12"><button className="btn btn-tp-dark px-5" disabled={busy}>
                  {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : <>Send message <i className="bi bi-arrow-right ms-1" /></>}
                </button></div>
              </form>
            </div>
          </div>
        </div></div>
      </section>
    </>
  );
}
