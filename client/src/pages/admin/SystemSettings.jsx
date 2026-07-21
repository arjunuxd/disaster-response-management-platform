import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { getInitials, formatDateTime } from '../../utils';
import PageHeader from '../../components/admin/PageHeader';

const SystemSettings = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put('/auth/me', profileData);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="System Settings" subtitle="Manage your admin profile and account settings" />

      {/* Profile Card */}
      <div className="card shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 px-6 py-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-lg">
              <span className="text-white text-xl font-bold">{getInitials(user?.fullName)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.fullName}</h2>
              <p className="text-navy-300 text-sm">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white mt-1.5 border border-white/10">
                Administrator
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Role</p>
            <p className="text-navy-900 font-semibold capitalize">{user?.role}</p>
          </div>
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Member Since</p>
            <p className="text-navy-900 font-semibold text-sm">{formatDateTime(user?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="card shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="section-title">Project Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Project Name</p>
            <p className="text-navy-900 font-semibold">DRMP</p>
          </div>
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-navy-900 font-semibold text-sm">Disaster Response & Management Platform</p>
          </div>
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Version</p>
            <p className="text-navy-900 font-semibold">1.0.0</p>
          </div>
          <div className="bg-navy-50 rounded-lg p-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">Stack</p>
            <p className="text-navy-900 font-semibold text-sm">MongoDB, Express, React, Node.js</p>
          </div>
        </div>
      </div>

      {/* Profile Update */}
      <div className="card shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="section-title">Update Profile</h3>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <input
                value={profileData.fullName}
                onChange={(e) => setProfileData((p) => ({ ...p, fullName: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="input-field bg-navy-50 text-navy-400 cursor-not-allowed"
              />
              <p className="text-xs text-navy-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input
                value={profileData.phone}
                onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="card shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-danger-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Change Password</h3>
            <p className="section-subtitle">Ensure your account remains secure</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="input-label">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
              required
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={6}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                minLength={6}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-danger"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;
