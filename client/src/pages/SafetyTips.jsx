import { Link } from 'react-router-dom';

const safetyData = [
  {
    type: 'Flood',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    tips: [
      'Move to higher ground immediately when water starts rising',
      'Never walk, swim, or drive through floodwater — 6 inches can knock you down',
      'Stay off bridges over fast-moving water',
      'Disconnect electrical appliances if safe to do so',
      'Do not return home until authorities say it is safe',
      'Boil or treat all water before drinking after flooding',
    ],
  },
  {
    type: 'Cyclone',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    tips: [
      'Board up windows with plywood or storm shutters',
      'Store drinking water in clean, covered containers',
      'Stay indoors in an interior room away from windows',
      'If outdoors, find sturdy shelter immediately — do not shelter under trees',
      'After the cyclone, watch for fallen power lines and weakened structures',
      'Report damage to local authorities',
    ],
  },
  {
    type: 'Earthquake',
    color: 'bg-gray-50 border-gray-200',
    iconColor: 'text-gray-600',
    tips: [
      'Drop, Cover, and Hold On under sturdy furniture',
      'Stay away from windows, outside walls, and heavy objects',
      'If in a vehicle, pull over and stop — stay inside until shaking stops',
      'If outdoors, move to an open area away from buildings and power lines',
      'After shaking stops, check for injuries and damage',
      'Be prepared for aftershocks',
    ],
  },
  {
    type: 'Heat Wave',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    tips: [
      'Stay indoors during peak heat hours (12 PM - 4 PM)',
      'Drink plenty of water — even if not thirsty',
      'Wear lightweight, loose-fitting, light-colored clothing',
      'Never leave children or pets in parked vehicles',
      'Recognize heat exhaustion: heavy sweating, weakness, cold/clammy skin — move to a cool place and cool down',
      'Call 108 immediately for heat stroke symptoms: high body temperature, hot/red skin, confusion',
    ],
  },
  {
    type: 'Landslide',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    tips: [
      'Listen for unusual sounds like trees cracking or boulders knocking',
      'Move away from the path of a landslide or debris flow',
      'If safe, move to higher ground away from the slide path',
      'Stay alert during and after heavy rainfall — most landslides occur during or after rain',
      'Avoid building on steep slopes or near cliff edges',
      'Report cracked ground or tilted trees to authorities',
    ],
  },
  {
    type: 'Fire',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
    tips: [
      'Get low and crawl under smoke — cleaner air is near the floor',
      'Feel doors before opening — if hot, do not open',
      'Use stairs, never elevators during a fire',
      'Stop, Drop, and Roll if your clothes catch fire',
      'Install smoke detectors on every level of your home',
      'Call 101 immediately — do not attempt to fight large fires',
    ],
  },
  {
    type: 'Chemical Leak',
    color: 'bg-teal-50 border-teal-200',
    iconColor: 'text-teal-600',
    tips: [
      'Move upwind and uphill from the leak immediately',
      'If indoors, seal windows and doors with wet towels or plastic sheeting',
      'Turn off ventilation systems if safe to do so',
      'Do not touch spilled chemicals — avoid skin and eye contact',
      'If exposed, remove contaminated clothing and flush skin/eyes with water',
      'Seek medical attention immediately',
    ],
  },
];

const SafetyTips = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Safety Tips</h1>
        <p className="text-gray-500 mt-1">Know what to do before, during, and after a disaster</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">In any emergency, call 112 immediately.</p>
            <p className="text-xs text-red-700 mt-1">
              These tips are for general guidance. Always follow instructions from
              emergency services and local authorities.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {safetyData.map((section) => (
          <div key={section.type} className={`rounded-lg border p-5 ${section.color}`}>
            <h2 className={`text-lg font-bold mb-3 ${section.iconColor}`}>{section.type}</h2>
            <ul className="space-y-2">
              {section.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg className={`w-4 h-4 mt-0.5 shrink-0 ${section.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/preparedness"
          className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors text-center"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Preparedness Guides</h3>
          <p className="text-xs text-gray-500">Step-by-step disaster preparedness</p>
        </Link>
        <Link
          to="/helplines"
          className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors text-center"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Emergency Helplines</h3>
          <p className="text-xs text-gray-500">Important emergency contact numbers</p>
        </Link>
      </div>
    </div>
  );
};

export default SafetyTips;
