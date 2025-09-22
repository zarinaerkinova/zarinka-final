import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/User';

const OnlyAuthorized = ({ children }) => {
  const { user, token } = useUserStore();

  if (!user || !token) {
    return <Navigate to="/register" />;
  }

  return <>{children}</>; // ✅ render protected content
};

export default OnlyAuthorized;