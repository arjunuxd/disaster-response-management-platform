import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils';
import { NotificationBell } from '../notifications';
import GlobalSearch from '../GlobalSearch';

const AdminNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-navbar sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/admin" className="flex items-center space-x-3 shrink-0 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-navy-900 leading-tight">DRMP Admin</h1>
                <p className="text-xs text-primary-600 font-medium">Management Portal</p>
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-2">
            <GlobalSearch />
            <div className="h-6 w-px bg-navy-100" />
            <NotificationBell />
            <div className="h-6 w-px bg-navy-100" />

            <Link
              to="/dashboard"
              className="btn-ghost btn-sm text-navy-500 hover:text-navy-700"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              User Panel
            </Link>

            <div className="h-6 w-px bg-navy-100" />

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-primary-50">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ring-2 ring-primary-50">
                <span className="text-primary-700 font-semibold text-xs">
                  {getInitials(user?.fullName)}
                </span>
              </div>
              <span className="text-sm font-medium text-navy-700 hidden lg:block max-w-[100px] truncate">
                {user?.fullName}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-ghost btn-sm text-navy-500 hover:text-danger-600 hover:bg-danger-50"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <Link
              to="/dashboard"
              className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors duration-200"
              title="Switch to User Panel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </Link>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-xs">
                {getInitials(user?.fullName)}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-navy-500 hover:text-danger-600 hover:bg-danger-50 transition-colors duration-200"
              aria-label="Sign out"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
