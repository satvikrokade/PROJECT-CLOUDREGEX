import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import API_URL from '../apiConfig';

const API_BASE = `${API_URL}/api`;

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [liveStats, setLiveStats] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/complaints/statistics/`)
            .then(r => r.json())
            .then(data => setLiveStats(data))
            .catch(err => console.error('Stats error:', err));
    }, []);

    // Particle animation effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
            },
        },
    };

    const features = [
        {
            icon: '🛰️',
            title: 'Smart Intake',
            description: 'Structured forms collect category, location, and impact details in one smooth flow.',
        },
        {
            icon: '📍',
            title: 'Geo-focused Tracking',
            description: 'Pinpoint where an issue happened so teams can triage and dispatch faster.',
        },
        {
            icon: '🔁',
            title: 'Real-time Status',
            description: 'See movement from pending to resolved with transparent stage updates.',
        },
        {
            icon: '🧠',
            title: 'Action Insights',
            description: 'Dashboards summarize trend hotspots and performance for better decisions.',
        },
    ];

    const timeline = [
        { label: 'Issue Reported', eta: 'Instant' },
        { label: 'Department Assigned', eta: 'Under 2 hours' },
        { label: 'Field Action Started', eta: 'Within 1 day' },
        { label: 'Citizen Confirmation', eta: 'After resolution' },
    ];

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} className="particles" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="page-wrap"
                style={{ position: 'relative', zIndex: 1 }}
            >
                {/* Hero Section */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        textAlign: 'center',
                        marginBottom: '5rem',
                    }}
                >
                    <motion.h1
                        className="gradient-text"
                        style={{
                            fontSize: 'clamp(3rem, 8vw, 6rem)',
                            fontWeight: '800',
                            marginBottom: '2rem',
                            lineHeight: '1.2',
                        }}
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        Design-forward Municipal
                        <br />
                        Complaint Experience
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        style={{
                            fontSize: '1.4rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '900px',
                            margin: '0 auto 3rem',
                            lineHeight: '1.8',
                        }}
                    >
                        Report civic issues, monitor progress, and collaborate with city teams through a responsive digital portal.
                    </motion.p>

                    {user ? (
                        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(0, 212, 255, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                className="gradient-btn"
                                onClick={() => navigate(
                                    user.is_staff ? '/admin-dashboard'
                                        : user.profile?.is_department_user ? '/dept-dashboard'
                                            : '/dashboard'
                                )}
                                style={{ fontSize: '1.2rem', padding: '1.2rem 3rem' }}
                            >
                                🚀 Go to Dashboard
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={itemVariants}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.2rem',
                                maxWidth: '900px',
                                margin: '0 auto',
                                width: '100%',
                            }}
                        >
                            {[
                                { icon: '👤', title: 'Citizen Login', sub: 'Report & track issues', to: '/login' },
                                { icon: '📝', title: 'Register', sub: 'Create a new account', to: '/register' },
                                { icon: '🏛️', title: 'Department', sub: 'Manage your dept cases', to: '/dept-login' },
                                { icon: '🔐', title: 'Admin Panel', sub: 'Oversee all operations', to: '/admin-login' },
                            ].map((item, i) => (
                                <Link key={i} to={item.to} style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        whileHover={{ y: -6, scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="glass"
                                        style={{
                                            padding: '1.6rem 1.2rem',
                                            borderRadius: '18px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 212, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(2, 8, 23, 0.45)';
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                            background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                                            borderRadius: '18px 18px 0 0',
                                            opacity: 0.7,
                                        }} />
                                        <div style={{ fontSize: '2.2rem', marginBottom: '0.7rem' }}>{item.icon}</div>
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            {item.sub}
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="glass surface"
                    style={{ marginBottom: '4rem', padding: '2.5rem' }}
                >
                    <div className="grid-auto">
                        {[
                            { value: liveStats ? liveStats.total_complaints : '—', label: 'Complaints filed' },
                            { value: liveStats ? `${liveStats.total_complaints > 0 ? Math.round(((liveStats.by_status?.resolved || 0) / liveStats.total_complaints) * 100) : 0}%` : '—', label: 'Resolution rate' },
                            { value: liveStats ? (liveStats.by_status?.pending || 0) : '—', label: 'Pending action' },
                            { value: '24/7', label: 'Portal availability' },
                        ].map((stat) => (
                            <div key={stat.label} style={{ textAlign: 'center', padding: '2rem 0.5rem' }}>
                                <div className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.8rem' }}>{stat.value}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginTop: '4rem',
                    }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="glass card-hover surface"
                            style={{
                                textAlign: 'center',
                                padding: '2.5rem 2rem',
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                }}
                                style={{
                                    fontSize: '3.5rem',
                                    marginBottom: '1.2rem',
                                }}
                            >
                                {feature.icon}
                            </motion.div>
                            <h3
                                className="gradient-text"
                                style={{
                                    fontSize: '1.6rem',
                                    marginBottom: '1.2rem',
                                    fontWeight: '700',
                                }}
                            >
                                {feature.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.15rem' }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="glass surface"
                    style={{
                        marginTop: '4rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem',
                        padding: '2.5rem',
                    }}
                >
                    <div className="glass surface" style={{ borderRadius: '18px', padding: '2rem' }}>
                        <h3 className="gradient-text" style={{ marginBottom: '1.5rem', fontSize: '1.7rem' }}>How It Flows</h3>
                        <div style={{ display: 'grid', gap: '1.2rem' }}>
                            {timeline.map((step, index) => (
                                <motion.div
                                    key={step.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '1.2rem 1.5rem',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '14px',
                                    }}
                                >
                                    <span style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{step.label}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>{step.eta}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="glass surface" style={{ borderRadius: '18px', padding: '2rem' }}>
                        <h3 className="gradient-text" style={{ marginBottom: '1.5rem', fontSize: '1.7rem' }}>Why Citizens Prefer It</h3>
                        <ul style={{ display: 'grid', gap: '1.2rem', listStyle: 'none' }}>
                            {[
                                'Single-window complaint lifecycle',
                                'Fast issue acknowledgment visibility',
                                'Consistent department communication',
                                'Better trust through transparent status',
                            ].map((item) => (
                                <li
                                    key={item}
                                    style={{
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '14px',
                                        padding: '1.2rem 1.5rem',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    ✨ {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
