import { Link } from 'react-router-dom';

const guides = [
  {
    category: 'Flood Preparedness',
    items: [
      { title: 'Know Your Risk', desc: 'Check if your area is in a flood-prone zone. Stay informed about monsoon forecasts and river levels.' },
      { title: 'Emergency Kit', desc: 'Keep a kit ready: drinking water (3 days), medications, flashlight, batteries, important documents in waterproof bags, and a whistle.' },
      { title: ' evacuation Plan', desc: 'Identify at least two evacuation routes from your home. Know the location of the nearest shelter. Keep vehicle fuelled during monsoon season.' },
      { title: 'During a Flood', desc: 'Move to higher ground immediately. Never walk or drive through floodwater. Stay away from bridges over fast-moving water. Listen to emergency broadcasts.' },
    ],
  },
  {
    category: 'Cyclone Preparedness',
    items: [
      { title: 'Stay Updated', desc: 'Monitor IMD cyclone warnings. Know the difference between a Cyclone Watch (48 hrs) and Cyclone Warning (24 hrs).' },
      { title: 'Secure Your Home', desc: 'Reinforce windows and doors. Trim loose branches. Store drinking water in clean containers. Keep emergency supplies ready.' },
      { title: 'During a Cyclone', desc: 'Stay indoors in an interior room. Keep away from windows. If evacuation is ordered, move to designated shelters immediately.' },
      { title: 'After a Cyclone', desc: 'Watch for fallen power lines and damaged structures. Avoid floodwater. Boil drinking water before use. Report damage to authorities.' },
    ],
  },
  {
    category: 'Earthquake Preparedness',
    items: [
      { title: 'Drop, Cover, Hold', desc: 'When shaking starts: Drop to the ground, take cover under sturdy furniture, and hold on until shaking stops.' },
      { title: 'Safe Spots', desc: 'Identify safe spots in each room: under sturdy tables, against interior walls, away from windows and heavy objects.' },
      { title: 'Secure Heavy Items', desc: 'Anchor bookshelves, water heaters, and heavy furniture to walls. Use latches on cabinets. Place heavy objects on lower shelves.' },
      { title: 'After an Earthquake', desc: 'Check for injuries and damage. Expect aftershocks. Avoid damaged buildings. Use text messages instead of calls to communicate.' },
    ],
  },
  {
    category: 'General Preparedness',
    items: [
      { title: 'Family Communication Plan', desc: 'Establish an out-of-area emergency contact. Ensure every family member knows the plan. Practice your evacuation routes.' },
      { title: 'Documents', desc: 'Keep copies of important documents (ID, insurance, medical records) in a waterproof bag. Store digital copies in cloud storage.' },
      { title: 'First Aid', desc: 'Take a basic first aid course. Keep a well-stocked first aid kit at home and in your vehicle.' },
      { title: 'Stay Informed', desc: 'Register for DRMP alerts. Follow local emergency management agencies. Download offline maps for your area.' },
    ],
  },
];

const Preparedness = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Disaster Preparedness</h1>
        <p className="text-gray-500 mt-1">Essential guides to help you prepare for and respond to disasters</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Preparedness saves lives.</p>
            <p className="text-xs text-amber-700 mt-1">
              These guides provide general guidance. Always follow official instructions from
              your local disaster management authority and emergency services.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {guides.map((guide, gi) => (
          <section key={gi}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {guide.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.items.map((item, ii) => (
                <div key={ii} className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Safety Tips by Disaster Type?</h3>
        <p className="text-sm text-gray-500 mb-4">
          View detailed safety instructions for specific disaster types.
        </p>
        <Link
          to="/safety"
          className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
        >
          View Safety Tips
        </Link>
      </div>
    </div>
  );
};

export default Preparedness;
