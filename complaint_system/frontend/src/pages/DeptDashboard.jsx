import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import API_URL from '../apiConfig';

const API_BASE = `${API_URL}/api`;

const DeptDashboard = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [updating, setUpdating] = useState(null);

    const department = user?.profile?.department || '';

    useEffect(() => {
        if (department) loadData();
    }, [department, statusFilter, priorityFilter]);

    const loadData = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);
            params.append('department', department);

            const [complaintsRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/complaints/?${params.toString()}`).then(r => r.json()),
                fetch(`${API_BASE}/complaints/statistics/`).then(r => r.json()),
            ]);
            setComplaints(complaintsRes.results || complaintsRes);
            setStats(statsRes);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    };

    const updateComplaint = async (id, field, value) => {
        setUpdating(id);
        try {
            const response = await fetch(`${API_BASE}/complaints/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
                body: JSON.stringify({ [field]: value }),
            });
            if (response.ok) {
                loadData();
            } else {
                const err = await response.json().catch(() => ({}));
                alert('Update failed: ' + JSON.stringify(err));
            }
        } catch (err) {
            alert('Network error updating complaint');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#fbbf24', acknowledged: '#60a5fa', in_progress: '#a78bfa',
            resolved: '#34d399', closed: '#9ca3af', rejected: '#f87171',
        };
        return colors[status] || '#9ca3af';
    };

    const getPriorityColor = (priority) => {
        const colors = { low: '#34d399', medium: '#fbbf24', high: '#f87171', critical: '#dc2626' };
        return colors[priority] || '#9ca3af';
    };

    const statuses = ['pending', 'acknowledged', 'in_progress', 'resolved', 'closed', 'rejected'];
    const priorities = ['low', 'medium', 'high', 'critical'];

    if (!department) {
        return (
            <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass surface" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ color: 'var(--text-primary)' }}>No Department Assigned</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Your account is not linked to any department.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', padding: '6rem 2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="glass surface" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                            🏛️ Department Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            Manage complaints for your department
                        </p>
                    </div>
                    <div style={{
                        padding: '0.6rem 1.2rem',
                        background: 'linear-gradient(135deg, #667eea33, #764ba233)',
                        border: '1px solid rgba(102,126,234,0.3)',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: 'var(--accent-blue)',
                    }}>
                        📌 {department}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
                {[
                    { label: 'Total', value: complaints.length, color: 'var(--accent-blue)', icon: '📊' },
                    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: '#fbbf24', icon: '⏳' },
                    { label: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, color: '#a78bfa', icon: '🔧' },
                    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#34d399', icon: '✅' },
                ].map((stat) => (
                    <div key={stat.label} className="glass card-hover surface" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Complaints Table */}
            <div className="glass surface">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <h2 className="gradient-text" style={{ fontSize: '1.4rem' }}>
                        Department Complaints
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '150px' }}>
                            <option value="">All Statuses</option>
                            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ minWidth: '150px' }}>
                            <option value="">All Priorities</option>
                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : complaints.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
                        <p style={{ color: 'var(--text-secondary)' }}>No complaints assigned to your department</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                    {['Ref', 'Title', 'Category', 'Citizen', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '0.7rem 0.5rem', textAlign: 'left',
                                            color: 'var(--text-secondary)', fontWeight: '700',
                                            fontSize: '0.82rem', textTransform: 'uppercase', whiteSpace: 'nowrap',
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <React.Fragment key={c.id}>
                                        <tr
                                            style={{
                                                borderBottom: '1px solid var(--glass-border)',
                                                cursor: 'pointer',
                                                opacity: updating === c.id ? 0.5 : 1,
                                            }}
                                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                                        >
                                            <td style={{ padding: '0.7rem 0.5rem', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                {c.reference_number}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {c.title}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {c.category_name}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {c.citizen_name || '—'}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem' }}>
                                                <span className="priority-pill" style={{
                                                    background: `${getPriorityColor(c.priority)}25`,
                                                    color: getPriorityColor(c.priority),
                                                    textTransform: 'uppercase', fontSize: '0.72rem',
                                                }}>
                                                    {c.priority}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem' }}>
                                                <span className="status-pill" style={{
                                                    background: `${getStatusColor(c.status)}33`,
                                                    color: getStatusColor(c.status),
                                                }}>
                                                    {c.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.5rem' }}>
                                                <span style={{ color: 'var(--accent-blue)', fontSize: '0.82rem' }}>
                                                    {expandedId === c.id ? '▲ Close' : '▼ Manage'}
                                                </span>
                                            </td>
                                        </tr>

                                        {expandedId === c.id && (
                                            <tr>
                                                <td colSpan={8} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div>
                                                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
                                                                👤 Citizen Details
                                                            </h4>
                                                            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                                                                <div><strong>Name:</strong> {c.citizen_name || '—'}</div>
                                                                <div><strong>Email:</strong> {c.citizen_email || '—'}</div>
                                                                {c.address && <div><strong>Address:</strong> {c.address}</div>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
                                                                ⚙️ Update Complaint
                                                            </h4>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                                <div>
                                                                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                                                                        Change Status:
                                                                    </label>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                                                        {statuses.map(s => (
                                                                            <button
                                                                                key={s}
                                                                                onClick={(e) => { e.stopPropagation(); updateComplaint(c.id, 'status', s); }}
                                                                                disabled={c.status === s || updating === c.id}
                                                                                style={{
                                                                                    padding: '0.35rem 0.6rem', borderRadius: '8px',
                                                                                    border: c.status === s ? `2px solid ${getStatusColor(s)}` : '1px solid rgba(255,255,255,0.1)',
                                                                                    background: c.status === s ? `${getStatusColor(s)}33` : 'rgba(255,255,255,0.03)',
                                                                                    color: getStatusColor(s),
                                                                                    cursor: c.status === s ? 'default' : 'pointer',
                                                                                    fontSize: '0.78rem', fontWeight: '600',
                                                                                    textTransform: 'capitalize',
                                                                                    opacity: c.status === s ? 1 : 0.7,
                                                                                }}
                                                                            >
                                                                                {s.replace('_', ' ')}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                                                                        Change Priority:
                                                                    </label>
                                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                                        {priorities.map(p => (
                                                                            <button
                                                                                key={p}
                                                                                onClick={(e) => { e.stopPropagation(); updateComplaint(c.id, 'priority', p); }}
                                                                                disabled={c.priority === p || updating === c.id}
                                                                                style={{
                                                                                    padding: '0.35rem 0.6rem', borderRadius: '8px',
                                                                                    border: c.priority === p ? `2px solid ${getPriorityColor(p)}` : '1px solid rgba(255,255,255,0.1)',
                                                                                    background: c.priority === p ? `${getPriorityColor(p)}25` : 'rgba(255,255,255,0.03)',
                                                                                    color: getPriorityColor(p),
                                                                                    cursor: c.priority === p ? 'default' : 'pointer',
                                                                                    fontSize: '0.78rem', fontWeight: '600',
                                                                                    textTransform: 'uppercase',
                                                                                    opacity: c.priority === p ? 1 : 0.7,
                                                                                }}
                                                                            >
                                                                                {p}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeptDashboard;
