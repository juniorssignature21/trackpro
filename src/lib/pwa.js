/* TrackPro PWA: service worker + "Install app" experience for Android, iPhone and desktop.
   Ported from the original assets/js/pwa.js. Works through delegated listeners on [data-install],
   [data-install-close] and [data-banner-close], so any React component can render those controls. */
let started = false;

export function initPwa() {
  if (started) return;
  started = true;

  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIOSSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios|opios|gsa\//i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  let deferred = null;

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  }

  if (isStandalone) { document.documentElement.classList.add('is-app'); return; }

  const show = () => document.documentElement.classList.add('can-install');
  const hide = () => { document.documentElement.classList.remove('can-install'); closeBanner(); };

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; show(); maybeBanner(); });
  window.addEventListener('appinstalled', () => {
    deferred = null; hide(); store.set('tp_installed', '1');
    toast('App installed – find it on your home screen 🎉');
  });

  const narrow = window.matchMedia('(max-width: 991px)');
  if (isIOS || narrow.matches) { show(); maybeBanner(); }
  narrow.addEventListener('change', e => { if (e.matches) { show(); maybeBanner(); } });

  function install() {
    if (!deferred) { openSheet(); return; }
    Promise.resolve(deferred.prompt()).catch(() => openSheet());
    deferred.userChoice.then(c => { if (c.outcome === 'accepted') hide(); deferred = null; }).catch(() => {});
  }

  function openSheet() {
    const sheet = document.getElementById('installSheet'); if (!sheet) return;
    sheet.querySelector('.ins-ios').hidden = !isIOS;
    sheet.querySelector('.ins-ios-other').hidden = !(isIOS && !isIOSSafari);
    sheet.querySelector('.ins-generic').hidden = isIOS;
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-lock');
  }
  function closeSheet() {
    const s = document.getElementById('installSheet');
    if (s) { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('sheet-lock');
  }

  // smart banner on phones (once a week at most, never on the full-screen map or in admin)
  let bannerTimer;
  function maybeBanner() {
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      const b = document.getElementById('installBanner');
      if (!b || window.innerWidth >= 992 || document.body.classList.contains('track-mode')) return;
      const last = +store.get('tp_banner_dismissed') || 0;
      if (Date.now() - last < 7 * 864e5) return;
      b.classList.add('show');
    }, 3500);
  }
  function closeBanner(remember) {
    const b = document.getElementById('installBanner'); if (!b) return;
    b.classList.remove('show'); if (remember) store.set('tp_banner_dismissed', Date.now());
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-install]')) { e.preventDefault(); closeBanner(true); install(); }
    if (e.target.closest('[data-install-close]')) { e.preventDefault(); closeSheet(); }
    if (e.target.closest('[data-banner-close]')) { e.preventDefault(); closeBanner(true); }
    if (e.target.id === 'installSheet') closeSheet();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
}

export function toast(msg) {
  const t = document.createElement('div'); t.className = 'tp-toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}
