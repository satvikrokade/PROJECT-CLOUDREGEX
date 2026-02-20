import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DeptRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '',
        department: '',
    });
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/auth/departments/')
            .then(res => res.json())
            .then(data => setDepartments(data.departments || []))
            .catch(() => setError('Failed to load departments'));
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getCookie = (name) => {
        const val = `; ${document.cookie}`;
        const parts = val.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }
        if (!formData.department) {
            setError('Please select a department');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/register-department/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                navigate('/dept-dashboard');
            } else {
                let msg = 'Registration failed.';
                if (data.non_field_errors) msg = data.non_field_errors[0];
                else if (data.detail) msg = data.detail;
                else if (data.username) msg = data.username[0];
                else if (data.email) msg = data.email[0];
                else if (data.password) msg = data.password[0];
                else if (data.department) msg = data.department[0];
                else if (typeof data === 'object') {
                    // Collect all error messages into a single string
                    msg = Object.values(data).flat().join(' ');
                }
                setError(msg);
            }
        } catch (err) {
            setError('Network error. Please try again.');
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
                style={{ maxWidth: '480px' }}
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
                    style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.4rem', textAlign: 'center' }}
                >
                    🏛️ Department Registration
                </motion.h2>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Register as department staff to manage complaints routed to your department.
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div className="field">
                            <label>First Name</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First name" required />
                        </div>
                        <div className="field">
                            <label>Last Name</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last name" required />
                        </div>
                    </div>

                    <div className="field">
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
                    </div>

                    <div className="field">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@gov.in" required />
                    </div>

                    <div className="field">
                        <label>Department *</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Department --</option>
                            <option value="ADMIN STAFF">ADMIN STAFF (Request Admin Access)</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div className="field">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                        </div>
                        <div className="field">
                            <label>Confirm Password</label>
                            <input type="password" name="password2" value={formData.password2} onChange={handleChange} placeholder="Confirm" required />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="gradient-btn"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                    >
                        {loading ? 'Registering...' : '🏛️ Register as Department Staff'}
                    </motion.button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                        Login here
                    </Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Are you a citizen?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
                        Register as Citizen
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default DeptRegister;
