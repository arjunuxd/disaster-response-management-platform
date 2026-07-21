import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-navy-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">DRMP</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-navy-400 max-w-xs">
              Disaster Response &amp; Management Platform. Empowering communities with
              real-time data for effective disaster preparedness and response.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/map" className="hover:text-white transition-colors duration-200">Disaster Map</Link></li>
              <li><Link to="/alerts" className="hover:text-white transition-colors duration-200">Alerts</Link></li>
              <li><Link to="/statistics" className="hover:text-white transition-colors duration-200">Statistics</Link></li>
              <li><Link to="/shelters" className="hover:text-white transition-colors duration-200">Shelters</Link></li>
              <li><Link to="/helplines" className="hover:text-white transition-colors duration-200">Helplines</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/preparedness" className="hover:text-white transition-colors duration-200">Preparedness Guides</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors duration-200">Safety Tips</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors duration-200">About DRMP</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>

          {/* Emergency Numbers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Emergency</h3>
            <div className="space-y-3">
              {[
                { label: 'National Emergency', number: '112' },
                { label: 'Disaster Response', number: '108' },
                { label: 'Ambulance', number: '102' },
              ].map((item) => (
                <div key={item.number} className="bg-navy-800/50 rounded-xl p-3.5 border border-navy-700/50">
                  <p className="text-xs text-navy-400 mb-1">{item.label}</p>
                  <a
                    href={`tel:${item.number}`}
                    className="text-white font-bold text-lg hover:text-primary-400 transition-colors duration-200"
                  >
                    {item.number}
                  </a>
                </div>
              ))}
              <Link
                to="/helplines"
                className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 font-medium text-xs mt-1 transition-colors duration-200"
              >
                View all helplines
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-700/50 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-500">
            &copy; {currentYear} DRMP &mdash; Disaster Response &amp; Management Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-navy-500">
            <Link to="/about" className="hover:text-navy-300 transition-colors duration-200">About</Link>
            <Link to="/contact" className="hover:text-navy-300 transition-colors duration-200">Contact</Link>
            <Link to="/faq" className="hover:text-navy-300 transition-colors duration-200">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
