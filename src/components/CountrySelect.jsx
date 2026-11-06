import { useSettings } from '../lib/settings';

/** <select> of serviceable countries (from /api/settings), home market first. */
export default function CountrySelect({ value, onChange, id, className = 'form-select tp-input', ...rest }) {
  const { countries, domestic_country: home } = useSettings();
  const homeCountry = countries.find(c => c.code === home);
  return (
    <select id={id} className={className} value={value} onChange={onChange} {...rest}>
      {homeCountry && <option value={homeCountry.code}>{homeCountry.name}</option>}
      <option disabled>──────────</option>
      {countries.filter(c => c.code !== home).map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
    </select>
  );
}
