import { useState } from 'react';

const faqData = [
  {
    q: 'What is DRMP?',
    a: 'DRMP (Disaster Response & Management Platform) is a digital platform for reporting, tracking, and managing disaster incidents. It connects citizens with emergency response authorities for faster, more coordinated disaster management.',
  },
  {
    q: 'Do I need an account to use DRMP?',
    a: 'No. You can view the disaster map, check active alerts, see statistics, find shelters, and access preparedness guides without an account. You need to register only to report incidents, receive personalized notifications, and track your reports.',
  },
  {
    q: 'How do I report a disaster incident?',
    a: 'After creating a free account, go to "Report Incident" from your dashboard. Fill in the incident type, title, description, severity, and use the interactive map to set the exact location. You can also attach up to 5 images.',
  },
  {
    q: 'What disaster types can I report?',
    a: 'DRMP supports 17 disaster types: Flood, Flash Flood, Cyclone, Storm Surge, Coastal Erosion, Landslide, Earthquake, Fire Accident, Building Collapse, Road Accident, Tree Fall, Heavy Rain, Heat Wave, Water Logging, Medical Emergency, Chemical Leak, and Other.',
  },
  {
    q: 'What happens after I submit a report?',
    a: 'Your report starts as "Pending." An administrator reviews it and changes the status to "Verified," "Rejected," or "Resolved." You receive real-time notifications for each status change.',
  },
  {
    q: 'How do emergency alerts work?',
    a: 'Administrators can broadcast alerts to specific districts or regions. Active alerts are displayed on the home page, alerts page, and can be viewed by all users. Alerts have priority levels (Low, Medium, High, Emergency) and expiration dates.',
  },
  {
    q: 'What is the disaster map?',
    a: 'The interactive map shows all reported incidents, risk zones, and emergency shelters on an OpenStreetMap layer. You can filter by disaster type, severity, status, and district. No login is required to view the map.',
  },
  {
    q: 'How do I find nearby shelters?',
    a: 'Visit the Shelters page (accessible without login) to see all registered emergency shelters, their capacity, status (Open/Closed), and contact information. Each shelter has a link to view its exact location on OpenStreetMap.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. DRMP uses JWT authentication, bcrypt password hashing, Helmet security headers, rate limiting, NoSQL injection prevention, and other security measures. User emails and passwords are never exposed in API responses.',
  },
  {
    q: 'Can I edit or delete my report?',
    a: 'Yes. You can edit the title, description, severity, address, and add new images to your report. You can also delete your report. Only administrators can change the report status.',
  },
  {
    q: 'How do I become an admin?',
    a: 'Admin access is granted by existing administrators. Contact your system administrator to request admin privileges.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-500 mt-1">Common questions about the DRMP platform</p>
      </div>

      <div className="space-y-2">
        {faqData.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">{item.q}</span>
              <svg
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
