import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(username, password);
            const user = data.user;

            if (!user.is_staff) {
                setError('Access denied. This login is for administrators only.');
                setLoading(false);
                return;
            }

            navigate('/admin-dashboard');
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 403) {
                setError('Session expired. Please refresh the page and try again.');
            } else {
                setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass auth-card"
                style={{ maxWidth: '440px' }}
            >
                {/* Admin Badge */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem', fontSize: '2rem',
                            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.35)',
                        }}
                    >
                        🔐
                    </motion.div>
                    <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                        Admin Login
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Sign in to access the admin control panel
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="error-banner"
                        style={{ marginBottom: '1rem' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div className="field">
                        <label>Admin Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '700',
                            border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#fff',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                        }}
                    >
                        {loading ? 'Signing in...' : '🔐 Sign In as Admin'}
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Are you a citizen?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                            Citizen Login
                        </Link>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Department staff?{' '}
                        <Link to="/dept-login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                            Department Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
