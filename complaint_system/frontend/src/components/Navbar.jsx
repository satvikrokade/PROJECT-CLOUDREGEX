import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="glass fixed top-0 left-0 right-0 z-50"
            style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem' }}>
                <Link to="/" style={{ textDecoration: 'none', minWidth: 0 }}>
                    <motion.h1
                        className="gradient-text"
                        whileHover={{ scale: 1.05 }}
                        style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <span>🏛️ CivicPulse</span>
                        <span
                            style={{
                                fontSize: '0.67rem',
                                letterSpacing: '0.06em',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '999px',
                                padding: '0.2rem 0.5rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            SMART TRACKING
                        </span>
                    </motion.h1>
                </Link>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {user ? (
                        <>
                            <Link to={user.is_staff ? '/admin-dashboard' : user.profile?.is_department_user ? '/dept-dashboard' : '/dashboard'} style={{ textDecoration: 'none' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="ghost-btn"
                                    style={{ padding: '0.55rem 0.9rem' }}
                                >
                                    Dashboard
                                </motion.button>
                            </Link>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>👤 {user.username}</span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '0.55rem 0.9rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Logout
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="ghost-btn"
                                    style={{ padding: '0.55rem 0.9rem' }}
                                >
                                    Login
                                </motion.button>
                            </Link>
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="gradient-btn"
                                    style={{ padding: '0.55rem 0.9rem' }}
                                >
                                    Register
                                </motion.button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
