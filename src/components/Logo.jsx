/** VDC Express Logistics wordmark. Inline SVG so it uses the page's Archivo web fonts on every device. */
export default function Logo({ light = false, height = 44, className = '' }) {
  const ink = light ? '#ffffff' : '#1d1d1f';
  const mark = light ? '#FFCC00' : '#1d1d1f';
  return (
    <svg className={className} viewBox="0 0 345 72" height={height} width={(height * 345) / 72} role="img" aria-label="VDC Express Logistics">
      <g fill={mark}>
        <rect x="0" y="22" width="22" height="5" rx="2.5" />
        <rect x="6" y="33" width="16" height="5" rx="2.5" />
        <rect x="12" y="44" width="10" height="5" rx="2.5" />
        <path d="M27 6h17l11 38L74 6h17L63 66H48z" />
      </g>
      <text x="98" y="44" fontFamily="'Archivo Black','Arial Black',Arial,sans-serif" fontSize="40" fontStyle="italic" fill={ink} letterSpacing="-1">VDC</text>
      <text x="214" y="31" fontFamily="Archivo,Arial,sans-serif" fontSize="19" fontWeight="800" fill={ink} letterSpacing="1.5">EXPRESS</text>
      <text x="214" y="52" fontFamily="Archivo,Arial,sans-serif" fontSize="14" fontWeight="600" fill={ink} letterSpacing="3.2">LOGISTICS</text>
    </svg>
  );
}
