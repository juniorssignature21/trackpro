import { useEffect, useState } from 'react';
import { mediaUrl } from '../lib/api';
import { fmtDateTime } from '../lib/format';

/** Package photos card + full-screen viewer (styles: .pg-*, .pv-* in style.css). */
export default function PhotoGallery({ photos }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const cur = photos[idx] || photos[0];

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('pv-lock');
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('pv-lock'); document.removeEventListener('keydown', onKey); };
  }, [open, photos.length]);

  const show = i => { setIdx(i); setOpen(true); };
  const go = d => setIdx(i => (i + d + photos.length) % photos.length);

  return (
    <>
      <div className="sheet-card p-0 overflow-hidden">
        <div className="pg-hero" onClick={() => show(0)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && show(0)} aria-label="Open package photos">
          <img src={mediaUrl(photos[0].url)} alt={photos[0].caption || 'Package photo'} loading="lazy" />
          <span className="pg-shade" />
          <span className="pg-verified"><i className="bi bi-patch-check-fill" /> Verified photo</span>
          <span className="pg-count"><i className="bi bi-images" /> {photos.length}</span>
          <div className="pg-meta"><b>{photos[0].caption || 'Your parcel'}</b><small>{fmtDateTime(photos[0].created_at)}</small></div>
          <span className="pg-zoom"><i className="bi bi-arrows-angle-expand" /></span>
        </div>
        {photos.length > 1 && (
          <div className="pg-strip">
            {photos.map((p, i) => (
              <button type="button" key={p.id} onClick={() => show(i)} aria-label={`Photo ${i + 1}`}>
                <img src={mediaUrl(p.url)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`pv${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label="Package photos">
        <div className="pv-top">
          <div><b>Package photos</b><br /><small>{idx + 1} of {photos.length}</small></div>
          <button type="button" className="round-btn pv-btn" onClick={() => setOpen(false)} aria-label="Close"><i className="bi bi-x-lg" /></button>
        </div>
        <div className="pv-main d-flex align-items-center justify-content-center position-relative px-3">
          {photos.length > 1 && <button type="button" className="round-btn pv-btn position-absolute start-0 ms-3" onClick={() => go(-1)} aria-label="Previous"><i className="bi bi-chevron-left" /></button>}
          {open && <img key={cur.id} src={mediaUrl(cur.url)} alt={cur.caption || 'Package photo'} />}
          {photos.length > 1 && <button type="button" className="round-btn pv-btn position-absolute end-0 me-3" onClick={() => go(1)} aria-label="Next"><i className="bi bi-chevron-right" /></button>}
        </div>
        <div className="pv-caption">{cur.caption} <small className="opacity-50 ms-2">{fmtDateTime(cur.created_at)}</small></div>
        <div className="pv-thumbs d-flex gap-2 justify-content-center overflow-auto">
          {photos.map((p, i) => (
            <button type="button" key={p.id} onClick={() => setIdx(i)} className="border-0 p-0 rounded-3 overflow-hidden flex-shrink-0"
              style={{ width: 64, height: 64, opacity: i === idx ? 1 : 0.45, outline: i === idx ? '3px solid var(--tp-yellow)' : 'none', outlineOffset: -3 }}>
              <img src={mediaUrl(p.url)} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
