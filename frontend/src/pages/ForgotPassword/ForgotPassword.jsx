import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/forgot-password', { email });
            toast.success(data.data);
        } catch (error) {
            toast.error(error.response.data.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
            <h2>Forgot Password</h2>
            <p>Enter your email address and we will send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#8b1538', color: 'white', border: 'none', borderRadius: '5px' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
