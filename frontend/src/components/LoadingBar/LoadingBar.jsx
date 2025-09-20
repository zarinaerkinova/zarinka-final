import React from 'react';
import { useLoadingStore } from '../../store/Loading';
import './LoadingBar.scss';

const LoadingBar = () => {
    const { loading } = useLoadingStore();

    return (
        <div className={`loading-bar ${loading ? 'visible' : ''}`}>
            <div className="loading-bar__progress"></div>
        </div>
    );
};

export default LoadingBar;
