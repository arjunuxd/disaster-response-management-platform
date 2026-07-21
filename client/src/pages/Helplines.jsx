const helplines = [
  {
    category: 'National Emergency',
    numbers: [
      { name: 'National Emergency Number', number: '112', description: 'Unified emergency number for Police, Fire, and Ambulance' },
      { name: 'Disaster Management', number: '108', description: 'NDRF and State Disaster Response Force' },
      { name: 'Ambulance', number: '102', description: 'Medical emergency ambulance service' },
      { name: 'Fire Brigade', number: '101', description: 'Fire and rescue services' },
      { name: 'Police', number: '100', description: 'Police control room' },
    ],
  },
  {
    category: 'Specialized Services',
    numbers: [
      { name: 'Women Helpline', number: '1091', description: '24x7 helpline for women in distress' },
      { name: 'Child Helpline', number: '1098', description: 'Child rescue and support (Childline)' },
      { name: 'Senior Citizen Helpline', number: '14567', description: 'Elder line for senior citizens' },
      { name: 'Mental Health Helpline', number: '08046110007', description: 'NIMHANS mental health support' },
      { name: 'Blood Bank', number: '104', description: 'Health Helpline and blood bank information' },
    ],
  },
  {
    category: 'Disaster-Specific',
    numbers: [
      { name: 'NDRF Control Room', number: '011-24363260', description: 'National Disaster Response Force headquarters' },
      { name: 'NDMA Control Room', number: '011-26701700', description: 'National Disaster Management Authority' },
      { name: 'IMD Weather', number: '1800-180-1551', description: 'India Meteorological Department information' },
      { name: 'Cyclone Alert', number: '1364', description: 'IMD cyclone warning service' },
      { name: 'Flood Control Room', number: '011-26701728', description: 'Central Water Commission flood warnings' },
    ],
  },
  {
    category: 'Utilities & Infrastructure',
    numbers: [
      { name: 'Electricity Emergency', number: '1912', description: 'Power grid failure and electrical emergencies' },
      { name: 'Gas Leak', number: '1800-233-0001', description: 'PNG/Gas leak emergency' },
      { name: 'Water Supply', number: '1916', description: 'Water supply complaints and emergencies' },
      { name: 'Road Accident', number: '1073', description: 'Road accident emergency services' },
    ],
  },
];

const Helplines = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Helpline Numbers</h1>
        <p className="text-gray-500 mt-1">Important emergency contact numbers for India</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">For any life-threatening emergency, call 112</p>
            <p className="text-xs text-red-600 mt-0.5">This number works on all mobile phones, even without a SIM card</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {helplines.map((group) => (
          <section key={group.category}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {group.category}
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {group.numbers.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    className="shrink-0 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors border border-primary-200"
                  >
                    {item.number}
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Save These Numbers</h3>
        <p className="text-sm text-gray-500">
          We recommend saving key emergency numbers in your phone contacts. On most smartphones,
          you can also set up emergency contacts that are accessible from the lock screen.
          Visit your phone&apos;s Settings &gt; Emergency to configure this.
        </p>
      </div>
    </div>
  );
};

export default Helplines;
