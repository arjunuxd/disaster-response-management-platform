import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getInitials, formatDateTime } from '../utils';
import { PageLoader } from '../components/ui/Loader';
import profileService from '../services/profileService';

const PHONE_REGEX = /^\+?[\d\s-]{7,15}$/;

const Profile = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });
  const [phoneError, setPhoneError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
      setPhoneError('Enter a valid phone number (7-15 digits)');
      return;
    }
    setPhoneError('');
    setSaving(true);
    try {
      const res = await profileService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
      });
      setProfile((prev) => ({ ...prev, ...res.data.data.user }));
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader text="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your account information</p>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="flex items-center gap-5 relative">
            <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center border-2 border-white/25 backdrop-blur-sm">
              <span className="text-white text-2xl font-bold">{getInitials(profile?.fullName)}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{profile?.fullName}</h2>
              <p className="text-primary-200 text-sm truncate">{profile?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white mt-2 capitalize backdrop-blur-sm">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-5" aria-label="Edit profile form" noValidate>
              <div>
                <label className="input-label">Full Name</label>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  value={formData.email}
                  disabled
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed</p>
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => { setFormData((p) => ({ ...p, phone: e.target.value })); setPhoneError(''); }}
                  placeholder="+91 XXXXX XXXXX"
                  className={`input-field ${phoneError ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}`}
                />
                {phoneError && <p className="mt-1.5 text-sm text-danger-600">{phoneError}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ProfileField label="Full Name" value={profile?.fullName} />
                <ProfileField label="Email" value={profile?.email} />
                <ProfileField label="Phone" value={profile?.phone || 'Not set'} />
                <ProfileField label="Role" value={profile?.role} capitalize />
                <div>
                  <p className="section-subtitle mb-1.5">Account Status</p>
                  <span className={profile?.isActive ? 'badge-success' : 'badge-danger'}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <ProfileField label="Member Since" value={formatDateTime(profile?.createdAt)} />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-primary"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="btn-danger"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, capitalize }) => (
  <div>
    <p className="section-subtitle mb-1.5">{label}</p>
    <p className={`text-gray-900 font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
  </div>
);

export default Profile;
