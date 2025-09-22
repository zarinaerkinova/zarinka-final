// src/components/OnlyAdmins.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/User';

const OnlyAdmins = ({ children }) => {
  const user = useUserStore(state => state.user);

  if (!user) {
    return <Navigate to="/register" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/catalog" />;
  }

  return <>{children}</>;
};

export default OnlyAdmins;
