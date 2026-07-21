const ShelterPopup = ({ shelter }) => {
  const isOpen = shelter.status === 'Open';
  const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${shelter.latitude},${shelter.longitude}`;

  return (
    <div className="min-w-[260px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {shelter.status}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Shelter</span>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
        {shelter.shelterName}
      </h3>
      <p className="text-[11px] text-gray-500 mb-2">
        {shelter.address}
      </p>
      <p className="text-[11px] text-gray-500 mb-2">
        {shelter.district}{shelter.state ? `, ${shelter.state}` : ''}
      </p>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-[10px] text-gray-400 block">Capacity</span>
          <span className="text-xs font-semibold text-gray-800">{shelter.capacity?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-[10px] text-gray-400 block">Contact</span>
          <span className="text-xs font-semibold text-gray-800 font-mono">{shelter.contactNumber || 'N/A'}</span>
        </div>
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-primary-600 text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
        style={{ color: '#fff' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Get Directions
      </a>
    </div>
  );
};

export default ShelterPopup;
