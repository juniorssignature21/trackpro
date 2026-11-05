import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Pixel "?" used next to the FAQ. */
const Q = [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0];
export function PixelQ({ color, size }) {
  return (
    <div className="px-q" style={{ '--c': color, gridTemplateColumns: `repeat(5,${size}px)` }}>
      {Q.map((on, i) => <i key={i} className={on ? 'on' : ''} style={{ width: size, height: size }} />)}
    </div>
  );
}

export const PxArrow = ({ color, style }) => <span className="px-arrow" style={{ ...(color ? { '--c': color } : {}), ...style }} />;

/** Accordion using Bootstrap's collapse data-API. */
export function Faq({ id, items, headingTag: H = 'h3', itemClass = '' }) {
  return (
    <div className="accordion tp-faq" id={id}>
      {items.map((it, i) => (
        <div className={`accordion-item ${itemClass}`} key={i} hidden={it.hidden}>
          <H className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#${id}-${i}`}>
              {it.q}
            </button>
          </H>
          <div id={`${id}-${i}`} className="accordion-collapse collapse" data-bs-parent={`#${id}`}>
            <div className="accordion-body">{it.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tracking-number form → /track/:id */
export function TrackForm({ children, className, initial = '' }) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initial);
  const [invalid, setInvalid] = useState(false);
  const submit = e => {
    e.preventDefault();
    const v = value.trim().toUpperCase().replace(/\s+/g, '');
    if (!v) { setInvalid(true); return; }
    navigate(`/track/${encodeURIComponent(v)}`);
  };
  const input = ({ className: extra = '', ...props } = {}) => (
    <input name="id" value={value} autoComplete="off" spellCheck={false}
      onChange={e => { setValue(e.target.value); setInvalid(false); }}
      className={`form-control tp-input${invalid ? ' is-invalid' : ''} ${extra}`}
      placeholder="Enter your tracking number" aria-label="Tracking number" {...props} />
  );
  return <form className={className} onSubmit={submit} noValidate>{children(input)}</form>;
}

export function Alert({ kind = 'danger', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${kind} tp-alert d-flex gap-2 align-items-start`} role="alert" style={{ whiteSpace: 'pre-line' }}>
      <i className={`bi ${kind === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} mt-1`} />
      <div className="flex-grow-1">{children}</div>
      {onClose && <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />}
    </div>
  );
}

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="text-center py-5 text-muted"><div className="spinner-border" role="status" /><div className="mt-2 small">{label}</div></div>
);
