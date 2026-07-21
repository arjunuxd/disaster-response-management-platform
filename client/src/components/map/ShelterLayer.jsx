import { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { shelterIcon } from '../../utils/leafletIcon';
import ShelterPopup from './ShelterPopup';

const ShelterLayer = memo(({ shelters }) => {
  if (!shelters || shelters.length === 0) return null;

  return shelters
    .filter((s) => s.latitude && s.longitude)
    .map((shelter) => (
      <Marker
        key={shelter._id}
        position={[shelter.latitude, shelter.longitude]}
        icon={shelterIcon}
      >
        <Popup maxWidth={340} closeButton>
          <ShelterPopup shelter={shelter} />
        </Popup>
      </Marker>
    ));
});

ShelterLayer.displayName = 'ShelterLayer';

export default ShelterLayer;
