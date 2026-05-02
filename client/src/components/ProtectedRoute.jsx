import { useAuth } from '../context/AuthContext.jsx';
import Login from '../pages/Login.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Login />;
}
