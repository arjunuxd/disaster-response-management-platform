import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const createDivIcon = (html, className = '', size = [32, 32]) => {
  return L.divIcon({
    html,
    className,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
};

const CATEGORY_ICONS = {
  water: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <path d="M4 13c1-2 3-2 4 0s3 2 4 0 3-2 4 0 3 2 4 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M4 16c1-2 3-2 4 0s3 2 4 0 3-2 4 0 3 2 4 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
    </svg>`,
  wind: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <path d="M4 9h10c1.5 0 2.5-1 2-2s-2-1.5-3 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M4 12h13c1.5 0 2.5-1 2-2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M4 15h8c1.5 0 2.5 1 2 2s-2 1.5-3 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>`,
  ground: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <path d="M8 17L12 7l4 10" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M10 14h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  fire: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <path d="M12 6c-2 3-5 5-5 8a5 5 0 0010 0c0-3-3-5-5-8z" fill="#fff" opacity="0.9"/>
      <path d="M12 10c-1 2-2.5 3-2.5 4.5a2.5 2.5 0 005 0c0-1.5-1.5-2.5-2.5-4.5z" fill="${color}" opacity="0.6"/>
    </svg>`,
  structural: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <rect x="7" y="8" width="10" height="10" rx="1" stroke="#fff" stroke-width="1.8" fill="none"/>
      <path d="M10 8V6h4v2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M7 14h10" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 1.5"/>
    </svg>`,
  medical: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  default: (color) => `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="${color}" stroke="${color}" stroke-width="1"/>
      <path d="M12 8v5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="12" cy="15.5" r="1.2" fill="#fff"/>
    </svg>`,
};

const TYPE_CATEGORY = {
  Flood: 'water',
  'Flash Flood': 'water',
  'Heavy Rain': 'water',
  'Water Logging': 'water',
  'Storm Surge': 'water',
  Cyclone: 'wind',
  'Coastal Erosion': 'ground',
  Landslide: 'ground',
  Earthquake: 'ground',
  'Fire Accident': 'fire',
  'Building Collapse': 'structural',
  'Tree Fall': 'structural',
  'Road Accident': 'structural',
  'Medical Emergency': 'medical',
  'Chemical Leak': 'medical',
  Other: 'default',
};

export const REPORT_TYPE_COLORS = {
  Flood: '#2563eb',
  'Flash Flood': '#3b82f6',
  Cyclone: '#7c3aed',
  'Storm Surge': '#6366f1',
  'Coastal Erosion': '#d97706',
  Landslide: '#92400e',
  Earthquake: '#6b7280',
  'Fire Accident': '#dc2626',
  'Building Collapse': '#b91c1c',
  'Road Accident': '#ea580c',
  'Tree Fall': '#16a34a',
  'Heavy Rain': '#0284c7',
  'Heat Wave': '#e11d48',
  'Water Logging': '#0891b2',
  'Medical Emergency': '#dc2626',
  'Chemical Leak': '#7c3aed',
  Other: '#6b7280',
};

export const disasterIcon = createDivIcon(
  CATEGORY_ICONS.default('#dc2626'),
  'disaster-marker',
  [32, 32]
);

export const floodIcon = disasterIcon;
export const erosionIcon = disasterIcon;

export const createColoredIcon = (color) => {
  return createDivIcon(
    CATEGORY_ICONS.default(color),
    `disaster-marker-${color?.replace('#', '')}`,
    [32, 32]
  );
};

export const getDisasterIcon = (type, typeColorMap = null) => {
  let color = '#6b7280';
  if (typeColorMap && typeColorMap[type]) {
    color = typeColorMap[type];
  } else if (REPORT_TYPE_COLORS[type]) {
    color = REPORT_TYPE_COLORS[type];
  }
  const category = TYPE_CATEGORY[type] || 'default';
  const iconFn = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
  return createDivIcon(
    iconFn(color),
    `disaster-marker-${type?.toLowerCase().replace(/\s+/g, '-')}`,
    [32, 32]
  );
};

export const shelterIcon = createDivIcon(
  `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21V10l9-7 9 7v11" fill="#16a34a" stroke="#15803d" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="8" y="14" width="8" height="7" fill="#fff" rx="1"/>
      <path d="M12 14v7" stroke="#15803d" stroke-width="1"/>
      <path d="M8 17h8" stroke="#15803d" stroke-width="1"/>
    </svg>
  </div>`,
  'shelter-icon',
  [36, 36]
);

export const userLocationIcon = createDivIcon(
  `<div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
    <div style="width:16px;height:16px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #2563eb, 0 2px 4px rgba(0,0,0,0.3);"></div>
  </div>`,
  'user-location-marker',
  [20, 20]
);

export const pickIcon = createDivIcon(
  `<div style="width:28px;height:38px;display:flex;align-items:flex-start;justify-content:center;">
    <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#dc2626"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>
  </div>`,
  'pick-marker',
  [28, 38]
);
