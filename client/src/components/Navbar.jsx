import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const publicLinks = [
  { to: '/map', label: 'Disaster Map' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/preparedness', label: 'Preparedness' },
];

const moreLinks = [
  { to: '/safety', label: 'Safety Tips' },
  { to: '/shelters', label: 'Shelters' },
  { to: '/helplines', label: 'Helplines' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isActivePrefix = (path) => location.pathname.startsWith(path);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeMobile(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    closeMobile();
    closeMore();
  }, [location.pathname, closeMobile, closeMore]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const linkClass = (active) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-primary-50 text-primary-700'
        : 'text-navy-600 hover:text-primary-600 hover:bg-primary-50/60'
    }`;

  return (
    <header className="bg-white shadow-navbar sticky top-0 z-40" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 shrink-0 group" aria-label="DRMP Home">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-navy-900 tracking-tight">DRMP</span>
              <span className="hidden md:inline text-xs text-navy-400 font-medium ml-2">Disaster Response Platform</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-0.5" role="navigation" aria-label="Main navigation">
            <Link to="/" className={linkClass(isActive('/'))}>
              Home
            </Link>
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={linkClass(
                  link.to === '/' ? isActive(link.to) : isActivePrefix(link.to)
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  moreOpen
                    ? 'bg-navy-50 text-navy-700'
                    : 'text-navy-500 hover:text-navy-700 hover:bg-navy-50/60'
                }`}
              >
                More
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-elevated border border-navy-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-2.5 text-sm transition-colors duration-150 ${
                        isActive(link.to)
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn-ghost btn-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="btn-ghost btn-sm text-navy-600 hover:text-navy-900"
                >
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-navy-100" />
                <button
                  onClick={logout}
                  className="btn-ghost btn-sm text-navy-600 hover:text-danger-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost btn-sm text-navy-600 hover:text-navy-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors duration-200"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute left-0 block w-full h-0.5 bg-current transition-all duration-300 ease-in-out ${mobileOpen ? 'top-2.5 rotate-45' : 'top-1'}`} />
              <span className={`absolute left-0 block w-full h-0.5 bg-current transition-all duration-300 ease-in-out ${mobileOpen ? 'opacity-0' : 'top-2.5'}`} />
              <span className={`absolute left-0 block w-full h-0.5 bg-current transition-all duration-300 ease-in-out ${mobileOpen ? 'top-2.5 -rotate-45' : 'top-4'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto px-4 py-4 space-y-1">
          <Link
            to="/"
            onClick={closeMobile}
            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-navy-700 hover:bg-navy-50'
            }`}
          >
            Home
          </Link>

          <div className="pt-2 pb-1 px-2">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Navigation</p>
          </div>
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActivePrefix(link.to) ? 'bg-primary-50 text-primary-700' : 'text-navy-600 hover:bg-navy-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 pb-1 px-2">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Resources</p>
          </div>
          {moreLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to) ? 'bg-primary-50 text-primary-700' : 'text-navy-600 hover:bg-navy-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-navy-100 my-3" />

          {isAuthenticated ? (
            <div className="space-y-2 pt-1">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMobile}
                  className="btn-primary btn-sm w-full justify-center text-center"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                onClick={closeMobile}
                className="btn-secondary btn-sm w-full justify-center text-center"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); closeMobile(); }}
                className="btn-ghost btn-sm w-full justify-center text-center text-danger-600 hover:bg-danger-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/login"
                onClick={closeMobile}
                className="btn-secondary btn-sm w-full justify-center text-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="btn-primary btn-sm w-full justify-center text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-navy-900/20 backdrop-blur-sm z-30"
          onClick={closeMobile}
        />
      )}
    </header>
  );
};

export default Navbar;
