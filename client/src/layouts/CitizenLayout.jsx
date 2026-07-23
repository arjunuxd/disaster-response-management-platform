import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CitizenTopbar from '../components/CitizenTopbar';
import Sidebar from '../components/Sidebar';

const FULL_WIDTH_ROUTES = ['/dashboard/map'];

const CitizenLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isFullWidth = FULL_WIDTH_ROUTES.includes(location.pathname);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CitizenTopbar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 min-h-0">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <main className={`flex-1 min-h-0 ${isFullWidth ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default CitizenLayout;
