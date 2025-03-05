import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Roles } from "../assets/constants";

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;
