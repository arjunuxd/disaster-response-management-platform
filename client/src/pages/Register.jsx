import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';

    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Enter a valid email';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';

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
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: 'At least 6 characters', met: formData.password.length >= 6 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Join DRMP to report incidents and receive real-time alerts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Create account form" noValidate>
        {errors.general && (
          <div className="bg-danger-50 border border-danger-500/20 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="input-label">
            Full Name <span className="text-danger-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className={`input-field ${errors.fullName ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
            placeholder="John Doe"
          />
          {errors.fullName && <p className="mt-1.5 text-sm text-danger-600">{errors.fullName}</p>}
        </div>

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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className={`input-field ${errors.password ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
            placeholder="At least 6 characters"
          />
          {errors.password && <p className="mt-1.5 text-sm text-danger-600">{errors.password}</p>}
          {formData.password.length > 0 && (
            <div className="mt-2 space-y-1">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-1.5 text-xs">
                  {check.met ? (
                    <svg className="w-3.5 h-3.5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={check.met ? 'text-success-600' : 'text-gray-400'}>{check.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="input-label">
            Confirm Password <span className="text-danger-500">*</span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`input-field ${errors.confirmPassword ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
            placeholder="Repeat your password"
          />
          {errors.confirmPassword && <p className="mt-1.5 text-sm text-danger-600">{errors.confirmPassword}</p>}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
