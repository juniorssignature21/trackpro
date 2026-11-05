import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { About, Business, Help, Services } from './pages/InfoPages';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import { TrackResult, TrackSearch } from './pages/Track';
import Receipt from './pages/Receipt';
import { AuthProvider, RequireAuth } from './admin/auth';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Shipments from './admin/Shipments';
import ShipmentEdit from './admin/ShipmentEdit';
import { Account, Messages, Quotes } from './admin/Inbox';
import { useTitle } from './lib/hooks';

function NotFound() {
  useTitle('Page not found');
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
          <Route path="messages" element={<Messages />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
