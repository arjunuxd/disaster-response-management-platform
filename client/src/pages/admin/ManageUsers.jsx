import { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/ui/Loader';
import Pagination from '../../components/ui/Pagination';
import SearchBox from '../../components/ui/SearchBox';
import FilterDropdown from '../../components/ui/FilterDropdown';
import AdminTable from '../../components/admin/AdminTable';
import PageHeader from '../../components/admin/PageHeader';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES } from '../../utils/constants';
import { formatDate, getInitials } from '../../utils';

const ManageUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    page: 1,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      params.page = filters.page;
      params.limit = 10;

      const res = await adminService.getUsers(params);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.toggleUserStatus(selectedUser._id);
      toast.success(`User ${selectedUser.isActive ? 'deactivated' : 'activated'} successfully.`);
      setShowToggleConfirm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.deleteUser(selectedUser._id);
      toast.success('User deleted successfully.');
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-navy-600 font-semibold text-xs">{getInitials(row.fullName)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-navy-900 truncate">{row.fullName}</p>
            <p className="text-xs text-navy-400 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (row) => (
        <span className={row.role === 'admin' ? 'badge-danger' : 'badge-neutral'}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={row.isActive ? 'badge-success' : 'badge-danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Phone',
      render: (row) => <span className="text-sm text-navy-400">{row.phone || '—'}</span>,
    },
    {
      header: 'Joined',
      render: (row) => <span className="text-sm text-navy-400">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row);
              setShowToggleConfirm(true);
            }}
            className={row.isActive ? 'btn-ghost btn-xs text-warning-600 hover:bg-warning-50' : 'btn-ghost btn-xs text-success-600 hover:bg-success-50'}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row);
              setShowDeleteConfirm(true);
            }}
            className="btn-danger btn-xs"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Manage Users" subtitle="View and manage all registered users" />

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBox value={filters.search} onSearch={handleSearch} placeholder="Search by name or email..." />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              label="Role"
              options={USER_ROLES}
              value={filters.role}
              onChange={(v) => handleFilterChange('role', v)}
            />
            <FilterDropdown
              label="Status"
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              value={filters.isActive}
              onChange={(v) => handleFilterChange('isActive', v)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading users..." />
      ) : (
        <>
          <p className="text-sm text-navy-400 mb-4">{pagination.total} user(s) found</p>
          <div className="card overflow-hidden">
            <AdminTable columns={columns} data={users} emptyMessage="No users found." />
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showToggleConfirm}
        onClose={() => { setShowToggleConfirm(false); setSelectedUser(null); }}
        onConfirm={handleToggleStatus}
        title={selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${selectedUser?.isActive ? 'deactivate' : 'activate'} ${selectedUser?.fullName}? ${
          selectedUser?.isActive ? 'They will not be able to log in.' : 'They will be able to log in again.'
        }`}
        confirmText={selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        loading={actionLoading}
        danger={selectedUser?.isActive}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        loading={actionLoading}
        danger
      />
    </div>
  );
};

export default ManageUsers;
