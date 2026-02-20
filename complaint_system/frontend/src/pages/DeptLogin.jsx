import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DeptLogin = () => {
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

            // Check if account is pending approval (Department set but logic false)
            if (user.profile?.department && !user.profile?.is_department_user && !user.is_staff) {
                setError('Your account is pending Admin approval. Please contact the administrator.');
                setLoading(false);
                return;
            }

            // Only allow department users or admins through this login
            if (!user.profile?.is_department_user && !user.is_staff) {
                setError('This login is for department staff only. Please use the citizen login.');
                setLoading(false);
                return;
            }

            // Route based on role
            if (user.is_staff) {
                navigate('/admin-dashboard');
            } else {
                navigate('/dept-dashboard');
            }
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
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                    >
                        &larr; Back
                    </button>
                </div>

                {/* Dept Badge */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem', fontSize: '2rem',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
                        }}
                    >
                        🏛️
                    </motion.div>
                    <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                        Department Login
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Sign in to manage your department's complaints
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
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
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
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        }}
                    >
                        {loading ? 'Signing in...' : '🏛️ Sign In as Department Staff'}
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have a department account?{' '}
                        <Link to="/dept-register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                            Register here
                        </Link>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Are you a citizen?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                            Citizen Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default DeptLogin;
