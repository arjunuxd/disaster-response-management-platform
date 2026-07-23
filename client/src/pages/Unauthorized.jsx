import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { isAuthenticated } = useAuth();
  const homePath = isAuthenticated ? '/dashboard' : '/';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 bg-warning-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-warning-500/20">
          <svg className="w-10 h-10 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          You do not have the required permissions to access this page.
          If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to={homePath} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go Home
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
