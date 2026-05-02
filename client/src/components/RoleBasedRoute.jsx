import EmptyState from './EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleBasedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles || roles.includes(user.role)) return children;
  return <EmptyState title="Access restricted" message="Your account role does not permit this workspace." />;
}
