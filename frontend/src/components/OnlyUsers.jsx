import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/User';

const OnlyUsers = ({ children }) => {
    const user = useUserStore(state => state.user);

    if (!user) {
        return <Navigate to="/register" />;
    }

    if (user.role !== 'user') {
        return <Navigate to="/profile" />;
    }

    return <>{children}</>;
};

export default OnlyUsers;
