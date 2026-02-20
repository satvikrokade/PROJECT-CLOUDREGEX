import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import API_URL from '../apiConfig';

const API_BASE = `${API_URL}/api`;

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await fetch(`${API_BASE}/complaints/`);
            const data = await response.json();
            setComplaints(data.results || data);
        } catch (error) {
            console.error('Error loading complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#fbbf24',
            acknowledged: '#60a5fa',
            in_progress: '#a78bfa',
            resolved: '#34d399',
            closed: '#9ca3af',
            rejected: '#f87171',
        };
        return colors[status] || '#9ca3af';
    };

    const getStatusIcon = (status) => {
        return '';
    };

    const getPriorityColor = (priority) => {
        const colors = { low: '#34d399', medium: '#fbbf24', high: '#f87171', critical: '#dc2626' };
        return colors[priority] || '#9ca3af';
    };

    const statusOptions = ['all', 'pending', 'acknowledged', 'in_progress', 'resolved', 'closed', 'rejected'];

    const filteredComplaints = statusFilter === 'all'
        ? complaints
        : complaints.filter((c) => c.status === statusFilter);

    const stats = {
        total: complaints.length,
        open: complaints.filter((c) => ['pending', 'acknowledged', 'in_progress'].includes(c.status)).length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        closureRate: complaints.length
            ? Math.round((complaints.filter((c) => c.status === 'resolved').length / complaints.length) * 100)
            : 0,
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', padding: '6rem 2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div
                className="glass surface"
                style={{ marginBottom: '1rem' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '2.05rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                    Dashboard | {user?.first_name || user?.username || 'Guest'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Track all complaints, monitor progress, and submit new issues.
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {/* Submit New */}
                <div
                    className="glass card-hover surface"
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate('/submit-complaint')}
                >
                    <h3 className="gradient-text" style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                        Submit New Complaint
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.9rem', fontSize: '0.95rem' }}>
                        Report infrastructure or public service issues.
                    </p>
                    <button className="gradient-btn" style={{ width: '100%' }}>
                        Submit Complaint
                    </button>
                </div>

                {[
                    { label: 'Total', value: stats.total, sub: 'submitted complaints', icon: '' },
                    { label: 'Open', value: stats.open, sub: 'currently active', icon: '' },
                    { label: 'Resolved', value: stats.resolved, sub: 'completed cases', icon: '' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="glass surface card-hover"
                        style={{ textAlign: 'center' }}
                    >
                        <div className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '800' }}>
                            {item.value}
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.sub}</div>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="glass surface" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <strong>Resolution Progress</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{stats.closureRate}% closure rate</span>
                </div>
                <div style={{ height: '10px', width: '100%', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${stats.closureRate}%`,
                            borderRadius: '999px',
                            background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                            transition: 'width 0.7s ease',
                        }}
                    />
                </div>
            </div>

            {/* Complaint List */}
            <div className="glass surface">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                    <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>
                        All Complaints
                    </h2>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                className={statusFilter === status ? 'gradient-btn' : 'ghost-btn'}
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '0.38rem 0.75rem',
                                    fontSize: '0.82rem',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            No complaints found.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="glass surface"
                                style={{
                                    borderLeft: `4px solid ${getStatusColor(complaint.status)}`,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease',
                                }}
                                onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.08rem', marginBottom: '0.3rem' }}>
                                            {getStatusIcon(complaint.status)} {complaint.title}
                                        </h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Ref: {complaint.reference_number}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                        <span
                                            className="priority-pill"
                                            style={{
                                                background: `${getPriorityColor(complaint.priority)}25`,
                                                color: getPriorityColor(complaint.priority),
                                                textTransform: 'uppercase',
                                                fontSize: '0.72rem',
                                            }}
                                        >
                                            {complaint.priority}
                                        </span>
                                        <span
                                            className="status-pill"
                                            style={{
                                                background: `${getStatusColor(complaint.status)}33`,
                                                color: getStatusColor(complaint.status),
                                            }}
                                        >
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <div><strong>Category:</strong> {complaint.category_name}</div>
                                    <div><strong>Submitted:</strong> {new Date(complaint.created_at).toLocaleDateString()}</div>
                                    {complaint.citizen_name && <div><strong>By:</strong> {complaint.citizen_name}</div>}
                                </div>

                                {/* Expanded details */}
                                {expandedId === complaint.id && (
                                    <div style={{
                                        marginTop: '0.8rem',
                                        padding: '0.8rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                    }}>
                                        {complaint.address && (
                                            <div style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                                                <strong>Address:</strong> {complaint.address}
                                            </div>
                                        )}
                                        {complaint.citizen_email && (
                                            <div style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                                                <strong>Email:</strong> {complaint.citizen_email}
                                            </div>
                                        )}
                                        {complaint.latitude && complaint.longitude && (
                                            <div style={{ color: 'var(--text-muted)' }}>
                                                <strong>Coordinates:</strong> {complaint.latitude}, {complaint.longitude}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                                            <strong>Updated:</strong> {new Date(complaint.updated_at).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
