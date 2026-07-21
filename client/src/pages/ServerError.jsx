import { Link } from 'react-router-dom';

const ServerError = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-6xl font-bold text-red-300">500</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Server Error</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Something went wrong on our end. Our team has been notified and is working to fix the issue.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
