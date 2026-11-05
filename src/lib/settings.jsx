import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const DEFAULTS = {
  company_name: 'TrackPro Logistics',
  company_phone: '+1234567890',
  company_email: 'support@trackpro.local',
  company_address: '123 Demo Parcel Lane, Testford, London, ZZ99 9ZZ, United Kingdom',
  currency_symbol: '£',
  currency_code: 'GBP',
  vat_rate: 0.2,
  statuses: {
    pending: 'Booked', picked_up: 'Picked up', in_transit: 'In transit', at_hub: 'At hub', customs: 'In customs',
    out_for_delivery: 'Out for delivery', delivered: 'Delivered', on_hold: 'On hold',
    exception: 'Delivery exception', returned: 'Returned to sender',
  },
  service_types: ['Economy', 'Standard', 'Express', 'Same Day'],
  stamps: ['PAID', 'PART PAID', 'CUSTOMS CLEARED', 'REFUNDED', 'UNPAID'],
};

const Ctx = createContext(DEFAULTS);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  useEffect(() => {
    api.settings().then(s => setSettings({ ...DEFAULTS, ...s })).catch(() => {});
  }, []);
  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
