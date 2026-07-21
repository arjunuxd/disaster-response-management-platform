import { classNames } from '../../utils';

const variants = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={classNames(variants[variant], className)}>
      {children}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const map = {
    Low: 'info',
    Medium: 'warning',
    High: 'danger',
    Critical: 'danger',
  };
  return <Badge variant={map[severity] || 'neutral'}>{severity}</Badge>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'warning',
    Verified: 'info',
    Rejected: 'danger',
    Resolved: 'success',
  };
  return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    Low: 'info',
    Medium: 'warning',
    High: 'danger',
    Emergency: 'danger',
  };
  return <Badge variant={map[priority] || 'neutral'}>{priority}</Badge>;
};

export default Badge;
