import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: any) => {
  const { user, loading } = useAuth();

  // IMPORTANT: wait until Firebase finishes checking auth
  if (loading) {
    return (
      <div style={{ padding: 20, fontSize: 18 }}>
        Loading...
      </div>
    );
  }

  // not logged in → go login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;