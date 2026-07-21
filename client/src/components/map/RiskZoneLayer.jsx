import { memo } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { RISK_LEVEL_COLORS, RISK_CIRCLE_RADII } from '../../utils/mapConstants';
import RiskZonePopup from './RiskZonePopup';

const RiskZoneLayer = memo(({ zones, onEditZone, onDeleteZone }) => {
  if (!zones || zones.length === 0) return null;

  return zones
    .filter((z) => z.latitude && z.longitude)
    .map((zone) => {
      const colors = RISK_LEVEL_COLORS[zone.riskLevel] || RISK_LEVEL_COLORS.Low;
      const radius = RISK_CIRCLE_RADII[zone.riskLevel] || 500;

      return (
        <Circle
          key={zone._id}
          center={[zone.latitude, zone.longitude]}
          radius={radius}
          pathOptions={{
            color: colors.stroke,
            fillColor: colors.fill,
            fillOpacity: colors.fillOpacity,
            weight: 2,
          }}
        >
          <Popup maxWidth={340} closeButton>
            <RiskZonePopup zone={zone} onEdit={onEditZone} onDelete={onDeleteZone} />
          </Popup>
        </Circle>
      );
    });
});

RiskZoneLayer.displayName = 'RiskZoneLayer';

export default RiskZoneLayer;
