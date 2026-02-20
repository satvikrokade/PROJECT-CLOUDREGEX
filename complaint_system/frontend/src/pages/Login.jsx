import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(username, password);
            const user = data.user;

            // Only allow citizens through this login
            if (user.is_staff) {
                setError('This login is for citizens. Please use the Admin Login.');
                setLoading(false);
                return;
            }
            if (user.profile?.is_department_user) {
                setError('This login is for citizens. Please use the Department Login.');
                setLoading(false);
                return;
            }

            navigate('/dashboard');
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
            >
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                    >
                        &larr; Back
                    </button>
                </div>
                <motion.h2
                    className="gradient-text"
                    style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '0.55rem',
                        textAlign: 'center',
                    }}
                >
                    Welcome Back
                </motion.h2>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Login to track your complaint updates in real time.
                </p>

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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="field">
                        <label>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>
                            Password
                        </label>
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
                        className="gradient-btn"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>

                <div className="glass surface" style={{ marginTop: '1rem', borderRadius: '14px', fontSize: '0.9rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Quick access tips</div>
                    <ul style={{ marginTop: '0.35rem', paddingLeft: '1rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                        <li>Use your registered username and password.</li>
                        <li>Staff users are routed to the admin dashboard.</li>
                    </ul>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.1rem', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                        Register here
                    </Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Department staff?{' '}
                    <Link to="/dept-login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                        Department Login
                    </Link>
                    {' · '}
                    Admin?{' '}
                    <Link to="/admin-login" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: '600' }}>
                        Admin Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
