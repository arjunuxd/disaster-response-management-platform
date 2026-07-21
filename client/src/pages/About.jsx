const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">About DRMP</h1>
        <p className="text-gray-500 mt-1">Disaster Response &amp; Management Platform</p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            DRMP is a centralized digital platform designed to strengthen disaster preparedness,
            response, and recovery across India. By connecting citizens with authorities through
            real-time incident reporting, alerts, and data-driven decision making, we aim to
            reduce the impact of natural and man-made disasters on communities.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Incident Reporting', desc: 'Citizens can report disaster incidents with location data, images, and descriptions, enabling rapid response.' },
              { title: 'Real-time Alerts', desc: 'Authorities can broadcast emergency alerts to affected areas, ensuring timely warnings reach those at risk.' },
              { title: 'Interactive Mapping', desc: 'Live disaster maps showing incident reports, risk zones, and emergency shelters for situational awareness.' },
              { title: 'Analytics & Insights', desc: 'Data-driven dashboards help authorities identify patterns, allocate resources, and plan interventions.' },
              { title: 'Shelter Management', desc: 'Track emergency shelter availability, capacity, and contact information for displaced populations.' },
              { title: 'Multi-hazard Coverage', desc: 'Supports 17 disaster types including floods, cyclones, earthquakes, landslides, fires, and more.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Report', desc: 'Anyone can report a disaster incident with location, severity, and images.' },
              { step: '2', title: 'Verify', desc: 'Authorities review and verify reported incidents to ensure accuracy.' },
              { step: '3', title: 'Respond', desc: 'Emergency teams are dispatched based on verified reports and severity levels.' },
              { step: '4', title: 'Resolve', desc: 'Incidents are tracked through resolution with status updates and notifications.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Technology</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            DRMP is built on the MERN stack (MongoDB, Express.js, React, Node.js) with
            OpenStreetMap for mapping, Leaflet for interactive maps, and Chart.js for analytics
            visualization. The platform follows a 3-tier architecture with role-based access control,
            real-time notifications, and comprehensive security measures.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['MongoDB', 'Express.js', 'React', 'Node.js', 'Leaflet', 'Chart.js', 'TailwindCSS', 'JWT Auth'].map((tech) => (
              <div key={tech} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700">
                {tech}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
