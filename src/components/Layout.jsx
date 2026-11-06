import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AOS from 'aos';
import Navbar, { Topbar } from './Navbar';
import Footer, { InstallUI, TabBar } from './Footer';
import { initPwa } from '../lib/pwa';

/** Scroll to top on navigation, or to #hash targets (e.g. /services#express). */
function useScrollManagement() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
}

export default function Layout({ bare = false }) {
  const { pathname } = useLocation();
  useScrollManagement();

  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 60 });
    try { initPwa(); } catch (err) { console.error('PWA setup failed', err); } // never take the page down
  }, []);
  useEffect(() => {
    const t = setTimeout(() => AOS.refreshHard(), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      {!bare && <Topbar />}
      <Navbar />
      <main><Outlet /></main>
      {!bare && <Footer />}
      <InstallUI />
      <TabBar />
    </>
  );
}
