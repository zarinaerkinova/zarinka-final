import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            const { data } = await axios.post(`/api/auth/reset-password/${resetToken}`, { password });
            toast.success(data.data);
            navigate('/login');
        } catch (error) {
            toast.error(error.response.data.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#8b1538', color: 'white', border: 'none', borderRadius: '5px' }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
