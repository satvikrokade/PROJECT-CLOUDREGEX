import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        password2: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            const errorData = err.response?.data;
            let errorMsg = 'Registration failed. ';
            if (errorData) {
                Object.keys(errorData).forEach(key => {
                    if (Array.isArray(errorData[key])) {
                        errorMsg += `${key}: ${errorData[key].join(' ')} `;
                    }
                });
            }
            setError(errorMsg);
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
                    Create Account
                </motion.h2>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.4rem' }}>
                    Register once and manage all your civic complaints from one dashboard.
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div className="field">
                        <label>
                            Username *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="field">
                        <label>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <div className="field">
                            <label>
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                placeholder="First name"
                            />
                        </div>
                        <div className="field">
                            <label>
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 1234567890"
                        />
                    </div>

                    <div className="field">
                        <label>
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a strong password"
                        />
                    </div>

                    <div className="field">
                        <label>
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            required
                            placeholder="Re-enter your password"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="gradient-btn"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.45rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </motion.button>
                </form>

                <div className="glass surface" style={{ marginTop: '1rem', borderRadius: '14px', fontSize: '0.9rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>What happens next</div>
                    <ul style={{ marginTop: '0.35rem', paddingLeft: '1rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                        <li>Your account is created instantly.</li>
                        <li>You can immediately submit and track complaints.</li>
                    </ul>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.1rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                        Login here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
