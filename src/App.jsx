import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { About, Business, Help, Services } from './pages/InfoPages';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import { AuthProvider, RequireAuth } from './admin/auth';
import { useSeo } from './lib/hooks';

// Heavier, less-visited screens load on demand (map, QR codes, admin) so the public pages stay fast.
const named = (loader, name) => lazy(() => loader().then(m => ({ default: m[name] })));
const TrackSearch = named(() => import('./pages/Track'), 'TrackSearch');
const TrackResult = named(() => import('./pages/Track'), 'TrackResult');
const Receipt = lazy(() => import('./pages/Receipt'));
const Book = named(() => import('./pages/Book'), 'Book');
const BookConfirm = named(() => import('./pages/Book'), 'BookConfirm');
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Login = lazy(() => import('./admin/Login'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const Shipments = lazy(() => import('./admin/Shipments'));
const ShipmentEdit = lazy(() => import('./admin/ShipmentEdit'));
const Quotes = named(() => import('./admin/Inbox'), 'Quotes');
const Bookings = named(() => import('./admin/Inbox'), 'Bookings');
const Messages = named(() => import('./admin/Inbox'), 'Messages');
const Account = named(() => import('./admin/Inbox'), 'Account');

const Loading = () => <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}><span className="spinner-border" role="status" aria-label="Loading" /></div>;

function NotFound() {
  useSeo('Page not found', { noindex: true });
  return (
    <section className="tp-page-hero" style={{ minHeight: '60vh' }}>
      <div className="container">
        <h1>Lost in<br /><span style={{ background: 'var(--tp-ink)', color: 'var(--tp-yellow)', padding: '0 .15em' }}>transit</span></h1>
        <p className="fs-5 mt-3">We couldn&apos;t find that page. It may have been moved or never existed.</p>
        <div className="d-flex gap-2 flex-wrap mt-4"><Link to="/" className="btn btn-tp-dark">Go home</Link><Link to="/track" className="btn btn-outline-dark rounded-0 fw-bold px-4">Track a parcel</Link></div>
      </div>
    </section>
  );
}

// Old PHP/HTML URLs from the original site keep working.
const LEGACY = {
  '/index.php': '/', '/index.html': '/', '/index-2.html': '/', '/track.php': '/track', '/track.html': '/track',
  '/quote.php': '/quote', '/quote.html': '/quote', '/receipt.php': '/receipt', '/receipt.html': '/receipt',
  '/services.php': '/services', '/services.html': '/services', '/business.php': '/business', '/business.html': '/business',
  '/about.php': '/about', '/about.html': '/about', '/help.php': '/help', '/help.html': '/help',
  '/contact.php': '/contact', '/contact.html': '/contact',
};
function Legacy({ to }) {
  return <Navigate to={{ pathname: to, search: window.location.search, hash: window.location.hash }} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="business" element={<Business />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="contact" element={<Contact />} />
          <Route path="quote" element={<Quote />} />
          <Route path="track" element={<TrackSearch />} />
          <Route path="receipt" element={<Receipt />} />
          <Route path="book" element={<Book />} />
          <Route path="book/confirm" element={<BookConfirm />} />
          {Object.entries(LEGACY).map(([from, to]) => <Route key={from} path={from} element={<Legacy to={to} />} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<Layout bare />}>
          <Route path="track/:id" element={<TrackResult />} />
        </Route>

        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="shipments/:id" element={<ShipmentEdit />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}
