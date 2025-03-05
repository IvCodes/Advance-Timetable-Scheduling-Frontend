import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuth }) => {
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
