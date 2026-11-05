import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'aos/dist/aos.css';
import * as bootstrap from 'bootstrap'; // ESM build: registers the data-API (tabs, collapse, offcanvas, dropdowns)
import './styles/style.css';
import './styles/extra.css';

import App from './App';
import { SettingsProvider } from './lib/settings';

window.bootstrap = bootstrap; // used to close the off-canvas menu after navigation

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
