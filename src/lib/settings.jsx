import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

export const BRAND = 'VDC Express Logistics';

const DEFAULTS = {
  company_name: BRAND,
  company_phone: '+1 (555) 010-0199',
  company_email: 'support@vdcexpresslogistics.com',
  company_address: '100 Express Way, Suite 200, Houston, TX 77032, United States',
  currency_symbol: '$',
  currency_code: 'USD',
  vat_rate: 0,
  tax_label: 'Sales tax',
  fuel_surcharge: 0.18,
  domestic_country: 'US',
  statuses: {
    pending: 'Shipment information received', picked_up: 'Picked up', at_hub: 'Processed at facility',
    in_transit: 'In transit', customs: 'Customs clearance', out_for_delivery: 'With delivery courier',
    delivered: 'Delivered', attempted: 'Delivery attempted', on_hold: 'On hold', exception: 'Exception',
    returned: 'Returned to shipper',
  },
  service_types: ['Same Day', 'Express 9:00', 'Express 12:00', 'Express', 'Economy Select'],
  products: [
    { name: 'Same Day', code: 'SDX', icon: 'bi-rocket-takeoff-fill', by: 'end of day', blurb: 'Dedicated courier, collected and delivered today. Domestic only.', from: 53.1 },
    { name: 'Express 9:00', code: 'X09', icon: 'bi-alarm-fill', by: '9:00 AM', blurb: 'Time-definite: delivered by 9:00 AM on the next possible business day.', from: 55.46 },
    { name: 'Express 12:00', code: 'X12', icon: 'bi-clock-fill', by: '12:00 PM', blurb: 'Time-definite: delivered by noon on the next possible business day.', from: 40.12 },
    { name: 'Express', code: 'XPD', icon: 'bi-lightning-charge-fill', by: 'end of day', blurb: 'Delivered by end of the next possible business day.', from: 25.96 },
    { name: 'Economy Select', code: 'ECX', icon: 'bi-truck', by: 'end of day', blurb: 'Day-definite, lower-cost service for heavier, less urgent shipments.', from: 18.69 },
  ],
  international_from: 38.23,
  countries: [{ code: 'US', name: 'United States' }],
  limits: { pieces: 20, piece_kg: 150, side_cm: 150 },
  payments_enabled: true,
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

/** Country code -> name lookup built from the settings payload. */
export function useCountryName() {
  const { countries } = useSettings();
  return code => countries.find(c => c.code === code)?.name || code || '';
}
