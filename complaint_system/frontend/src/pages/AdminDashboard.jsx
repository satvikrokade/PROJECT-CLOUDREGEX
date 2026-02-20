import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import API_URL from '../apiConfig';

const API_BASE = `${API_URL}/api`;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tab, setTab] = useState('complaints');
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [showStaffOnly, setShowStaffOnly] = useState(true);

    useEffect(() => {
        if (tab === 'complaints') {
            loadData();
        } else {
            loadUsers();
        }
    }, [tab, statusFilter, priorityFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Fetch Users with explicit error handling
            const uRes = await fetch(`${API_BASE}/auth/users/`, { credentials: 'include' });
            if (!uRes.ok) {
                const errText = await uRes.text();
                throw new Error(`Users Fetch Failed: ${uRes.status} ${errText}`);
            }
            const usersRes = await uRes.json();

            // Fetch Departments
            const dRes = await fetch(`${API_BASE}/auth/departments/`, { credentials: 'include' });
            if (!dRes.ok) {
                console.warn('Departments fetch failed');
            }
            const deptsRes = dRes.ok ? await dRes.json() : { departments: [] };

            // Handle if lists are wrapped & FLATTEN profile data (support both flat and nested responses)
            const list = Array.isArray(usersRes) ? usersRes : usersRes.results || [];

            console.log("Users Loaded:", list.length, list);

            const flatUsers = list.map(u => ({
                ...u,
                department: u.department || u.profile?.department || '',
                is_department_user: (u.is_department_user !== undefined) ? u.is_department_user : (u.profile?.is_department_user || false)
            }));
            setUsers(flatUsers);
            setDepartments(deptsRes.departments || []);
        } catch (error) {
            console.error('Error loading users:', error);
            // Alert user so they can report the specific error
            alert(`Failed to load staff list: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Original loadData... keeping it but showing modified useEffect above covering both

    const loadData = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);

            const [complaintsRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/complaints/?${params.toString()}`, { credentials: 'include' }).then(r => r.json()),
                fetch(`${API_BASE}/complaints/statistics/`, { credentials: 'include' }).then(r => r.json()),
            ]);
            setComplaints(complaintsRes.results || complaintsRes);
            setStats(statsRes);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
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

    const updateUser = async (id, data) => {
        setUpdating(id);
        try {
            const response = await fetch(`${API_BASE}/auth/users/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            if (response.ok) {
                alert('User updated successfully!');
                loadUsers();
            } else {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.detail || errData.error || Object.values(errData).flat().join(', ') || 'Unknown error';
                alert(`Update failed: ${errMsg}`);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
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

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', padding: '6rem 2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="glass surface" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.05rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Manage complaints, perform data analysis, and manage staff access.
                        {user && !user.is_staff && user.profile?.is_department_user && (
                            <span style={{
                                marginLeft: '1rem',
                                padding: '0.2rem 0.6rem',
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                LIMITED STAFF ACCESS (READ-ONLY)
                            </span>
                        )}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '12px' }}>
                    <button
                        onClick={() => setTab('complaints')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: tab === 'complaints' ? 'var(--accent-blue)' : 'transparent',
                            color: tab === 'complaints' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Complaints
                    </button>
                    {user?.is_superuser && (
                        <button
                            onClick={() => setTab('users')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: tab === 'users' ? 'var(--accent-purple)' : 'transparent',
                                color: tab === 'users' ? '#fff' : 'var(--text-secondary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Staff Management
                        </button>
                    )}
                </div>
            </div>

            {tab === 'complaints' ? (
                <>
                    {/* Statistics Cards */}
                    {stats && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
                            {[
                                { label: 'Total', value: stats.total_complaints, color: 'var(--accent-blue)', icon: '' },
                                { label: 'Pending', value: stats.by_status?.pending || 0, color: '#fbbf24', icon: '' },
                                { label: 'In Progress', value: stats.by_status?.in_progress || 0, color: '#a78bfa', icon: '' },
                                { label: 'Resolved', value: stats.by_status?.resolved || 0, color: '#34d399', icon: '' },
                                { label: 'Rejected', value: stats.by_status?.rejected || 0, color: '#f87171', icon: '' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="glass card-hover surface"
                                    style={{ textAlign: 'center' }}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color, marginBottom: '0.15rem' }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Category Breakdown */}
                    {stats && stats.by_category && (
                        <div className="glass surface" style={{ marginBottom: '1rem' }}>
                            <h3 className="gradient-text" style={{ marginBottom: '0.8rem', fontSize: '1.2rem' }}>
                                Complaints by Category
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
                                {Object.entries(stats.by_category).map(([name, count]) => (
                                    <div
                                        key={name}
                                        style={{
                                            padding: '0.8rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '10px',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-blue)' }}>{count}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Visual Bar */}
                    {stats && stats.total_complaints > 0 && (
                        <div className="glass surface" style={{ marginBottom: '1rem' }}>
                            <h3 className="gradient-text" style={{ marginBottom: '0.6rem', fontSize: '1.1rem' }}>Status Distribution</h3>
                            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                {statuses.map(s => {
                                    const count = stats.by_status?.[s] || 0;
                                    const pct = (count / stats.total_complaints) * 100;
                                    if (pct === 0) return null;
                                    return (
                                        <div
                                            key={s}
                                            title={`${s.replace('_', ' ')}: ${count}`}
                                            style={{
                                                width: `${pct}%`,
                                                background: getStatusColor(s),
                                                transition: 'width 0.5s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: '#000',
                                                minWidth: pct > 8 ? '0' : '0',
                                            }}
                                        >
                                            {pct > 10 ? `${Math.round(pct)}%` : ''}
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                                {statuses.map(s => (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(s) }} />
                                        {s.replace('_', ' ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Complaints Table */}
                    <div className="glass surface">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>
                                All Complaints
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
                                <p style={{ color: 'var(--text-secondary)' }}>No complaints found</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                            {['Ref', 'Title', 'Category', 'Department', 'Citizen', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                                                <th key={h} style={{
                                                    padding: '0.7rem 0.5rem',
                                                    textAlign: 'left',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: '700',
                                                    fontSize: '0.82rem',
                                                    textTransform: 'uppercase',
                                                    whiteSpace: 'nowrap',
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
                                                        {c.department || '-'}
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {c.citizen_name || '-'}
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.5rem' }}>
                                                        <span className="priority-pill" style={{
                                                            background: `${getPriorityColor(c.priority)}25`,
                                                            color: getPriorityColor(c.priority),
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.72rem',
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
                                                            {expandedId === c.id ? '[^] Close' : (user?.is_staff ? '[v] Manage' : '[v] View')}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Expanded management row */}
                                                {expandedId === c.id && (
                                                    <tr>
                                                        <td colSpan={9} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                                {/* Citizen Info */}
                                                                <div>
                                                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
                                                                        Citizen Details
                                                                    </h4>
                                                                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                                                                        <div><strong>Name:</strong> {c.citizen_name || '-'}</div>
                                                                        <div><strong>Email:</strong> {c.citizen_email || '-'}</div>
                                                                        {c.address && <div><strong>Address:</strong> {c.address}</div>}
                                                                        {c.latitude && c.longitude && (
                                                                            <div><strong>Location:</strong> {c.latitude}, {c.longitude}</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Admin Actions */}
                                                                <div>
                                                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
                                                                        {user?.is_staff ? 'Update Complaint' : 'Status Information'}
                                                                    </h4>
                                                                    {user?.is_staff ? (
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
                                                                                                padding: '0.35rem 0.6rem',
                                                                                                borderRadius: '8px',
                                                                                                border: c.status === s ? `2px solid ${getStatusColor(s)}` : '1px solid rgba(255,255,255,0.1)',
                                                                                                background: c.status === s ? `${getStatusColor(s)}33` : 'rgba(255,255,255,0.03)',
                                                                                                color: getStatusColor(s),
                                                                                                cursor: c.status === s ? 'default' : 'pointer',
                                                                                                fontSize: '0.78rem',
                                                                                                fontWeight: '600',
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
                                                                                                padding: '0.35rem 0.6rem',
                                                                                                borderRadius: '8px',
                                                                                                border: c.priority === p ? `2px solid ${getPriorityColor(p)}` : '1px solid rgba(255,255,255,0.1)',
                                                                                                background: c.priority === p ? `${getPriorityColor(p)}25` : 'rgba(255,255,255,0.03)',
                                                                                                color: getPriorityColor(p),
                                                                                                cursor: c.priority === p ? 'default' : 'pointer',
                                                                                                fontSize: '0.78rem',
                                                                                                fontWeight: '600',
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
                                                                    ) : (
                                                                        <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                                                            <div>Current Status: <strong style={{ color: getStatusColor(c.status) }}>{c.status.replace('_', ' ').toUpperCase()}</strong></div>
                                                                            <div style={{ marginTop: '0.4rem' }}>Current Priority: <strong style={{ color: getPriorityColor(c.priority) }}>{c.priority.toUpperCase()}</strong></div>
                                                                            <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                                * You have read-only access to this complaint as a department staff member.
                                                                            </p>
                                                                        </div>
                                                                    )}
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
                </>
            ) : (
                <div className="glass surface">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>
                            Manage Staff & Access
                        </h2>
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            {showStaffOnly ? (
                                <button
                                    onClick={() => setShowStaffOnly(false)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        color: '#fff', border: 'none', cursor: 'pointer',
                                        fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                    }}
                                >
                                    Add New Staff
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowStaffOnly(true)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    Back to Staff List
                                </button>
                            )}
                            <button
                                onClick={loadUsers}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                    background: 'var(--glass-hover)', color: 'var(--text-primary)',
                                    border: 'none', cursor: 'pointer'
                                }}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {!showStaffOnly && (
                        <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', borderLeft: '3px solid #34d399', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <strong>To add staff:</strong> Find a user in the list below and click <strong>"Grant Access"</strong> within the <em>Actions</em> column. You can also assign them a department.
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                    {['Username', 'Full Name', 'Role', 'Department', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => !showStaffOnly || u.is_staff || u.is_department_user || u.department).map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{u.username}</td>
                                        <td style={{ padding: '1rem' }}>{u.first_name} {u.last_name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {u.is_staff ? (
                                                <span className="priority-pill" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>Admin</span>
                                            ) : u.is_department_user ? (
                                                <span className="priority-pill" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#d8b4fe' }}>Staff</span>
                                            ) : u.department ? (
                                                <span className="priority-pill" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>Pending</span>
                                            ) : (
                                                <span className="priority-pill" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#6ee7b7' }}>Citizen</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={u.department || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Automatically toggles department_user if dept is selected
                                                    if (confirm(`Assign ${u.username} to ${val || 'General'}?`)) {
                                                        updateUser(u.id, {
                                                            department: val,
                                                            is_department_user: !!val // If val exists, true. If empty, false (unless overridden)
                                                        });
                                                    }
                                                }}
                                                disabled={false}
                                                style={{ padding: '0.4rem', borderRadius: '6px', fontSize: '0.9rem' }}
                                            >
                                                <option value="">- No Dept -</option>
                                                {departments.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => {
                                                    const newVal = !u.is_staff;
                                                    if (confirm(`${newVal ? 'Promote' : 'Demote'} ${u.username} to/from Admin?`)) {
                                                        updateUser(u.id, { is_staff: newVal });
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: u.is_staff ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                    color: u.is_staff ? '#fca5a5' : '#fbbf24',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {u.is_staff ? 'Revoke Admin' : 'Make Admin'}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const newVal = !u.is_department_user;
                                                    if (confirm(`${newVal ? 'Enable' : 'Disable'} staff access for ${u.username}?`)) {
                                                        updateUser(u.id, {
                                                            is_department_user: newVal
                                                        });
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: u.is_department_user ? 'rgba(124, 58, 237, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                                                    color: u.is_department_user ? '#d8b4fe' : '#6ee7b7',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {u.is_department_user ? 'Revoke Staff' : 'Grant Staff'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
