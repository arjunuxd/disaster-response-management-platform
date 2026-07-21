import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const from = location.state?.from?.pathname;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const userData = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      const redirectTo = from || (userData.role === 'admin' ? '/admin' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Access your dashboard and manage disaster reports
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form" noValidate>
        {errors.general && (
          <div className="bg-danger-50 border border-danger-500/20 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="input-label">
            Email <span className="text-danger-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`input-field ${errors.email ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1.5 text-sm text-danger-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="input-label">
            Password <span className="text-danger-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            className={`input-field ${errors.password ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
            placeholder="Enter your password"
          />
          {errors.password && <p className="mt-1.5 text-sm text-danger-600">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
