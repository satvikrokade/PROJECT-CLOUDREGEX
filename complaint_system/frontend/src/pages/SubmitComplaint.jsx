import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import API_URL from '../apiConfig';

const API_BASE = `${API_URL}/api`;

const SubmitComplaint = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationInput, setLocationInput] = useState({ lat: '', lng: '' });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        citizen_name: '',
        citizen_email: '',
        citizen_phone: '',
        address: '',
        photo: null
    });

    useEffect(() => {
        fetch(`${API_BASE}/categories/`)
            .then(res => res.json())
            .then(data => setCategories(data.results || data))
            .catch(err => console.error('Failed to load categories:', err));
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationInput({
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6)
                    });
                },
                () => setError('Unable to get your location.')
            );
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setLocationInput(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCategory) {
            setError('Please select a category');
            return;
        }

        setLoading(true);
        setError('');

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('category_id', selectedCategory);
        submitData.append('citizen_name', formData.citizen_name);
        submitData.append('citizen_email', formData.citizen_email);
        submitData.append('citizen_phone', formData.citizen_phone || '');
        submitData.append('address', formData.address || '');

        if (locationInput.lat && locationInput.lng) {
            submitData.append('latitude', locationInput.lat);
            submitData.append('longitude', locationInput.lng);
        }

        if (formData.photo) {
            submitData.append('photo', formData.photo);
        }

        try {
            const response = await fetch(`${API_BASE}/complaints/`, {
                method: 'POST',
                body: submitData
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess('Complaint submitted successfully! Reference: ' + data.reference_number);
                setFormData({ title: '', description: '', citizen_name: '', citizen_email: '', citizen_phone: '', address: '', photo: null });
                setSelectedCategory(null);
                setLocationInput({ lat: '', lng: '' });
                setPhotoPreview(null);
                setTimeout(() => navigate('/'), 3000);
            } else {
                const errData = await response.json().catch(() => ({}));
                setError('Failed to submit: ' + JSON.stringify(errData));
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)',
        color: 'white',
        fontSize: '0.95rem',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.85)',
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', margin: '0 auto 1rem' }}
                    >
                        &larr; Back
                    </button>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        🏛️ Submit a Complaint
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Report issues and track their resolution with transparency
                    </p>
                </div>

                {/* Notifications */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#34d399',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {success}
                    </div>
                )}

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* LEFT: Complaint Form */}
                    <div className="glass surface" style={{ padding: '2rem' }}>
                        <h2 className="gradient-text" style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                            Complaint Details
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* Categories */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Category *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            style={{
                                                padding: '0.8rem',
                                                border: selectedCategory === cat.id
                                                    ? '2px solid #667eea'
                                                    : '2px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px',
                                                background: selectedCategory === cat.id
                                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                                    : 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                textAlign: 'center',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '0.2rem' }}>
                                                {cat.icon || '📋'}
                                            </span>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Title *</label>
                                <input
                                    type="text" name="title" value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of the issue"
                                    required style={inputStyle}
                                />
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Description *</label>
                                <textarea
                                    name="description" value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide detailed information"
                                    required
                                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>

                            {/* Name */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Your Name *</label>
                                <input
                                    type="text" name="citizen_name" value={formData.citizen_name}
                                    onChange={handleInputChange}
                                    placeholder="Full name" required style={inputStyle}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Email *</label>
                                <input
                                    type="email" name="citizen_email" value={formData.citizen_email}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com" required style={inputStyle}
                                />
                            </div>

                            {/* Phone */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Phone (Optional)</label>
                                <input
                                    type="tel" name="citizen_phone" value={formData.citizen_phone}
                                    onChange={handleInputChange}
                                    placeholder="+91 1234567890" style={inputStyle}
                                />
                            </div>

                            {/* Photo */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Upload Photo (Optional)</label>
                                <div
                                    onClick={() => document.getElementById('photoInput').click()}
                                    style={{
                                        border: '2px dashed rgba(255,255,255,0.15)',
                                        borderRadius: '10px',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        type="file" id="photoInput" accept="image/*"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px' }}
                                        />
                                    ) : (
                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>📸 Click to upload photo</span>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit" className="gradient-btn"
                                disabled={loading}
                                style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
                            >
                                {loading ? 'Submitting...' : '🚀 Submit Complaint'}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Location Panel */}
                    <div className="glass surface" style={{ padding: '2rem' }}>
                        <h2 className="gradient-text" style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                            Location & Address
                        </h2>

                        <button
                            type="button" onClick={getCurrentLocation}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                cursor: 'pointer',
                                marginBottom: '1.5rem',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                            }}
                        >
                            📍 Use My Current Location
                        </button>

                        {/* Lat / Lng inputs */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Latitude</label>
                            <input
                                type="text" name="lat" value={locationInput.lat}
                                onChange={handleLocationChange}
                                placeholder="e.g., 28.613900" style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Longitude</label>
                            <input
                                type="text" name="lng" value={locationInput.lng}
                                onChange={handleLocationChange}
                                placeholder="e.g., 77.209000" style={inputStyle}
                            />
                        </div>

                        {locationInput.lat && locationInput.lng && (
                            <div style={{
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                marginBottom: '1.5rem',
                                color: '#34d399',
                            }}>
                                ✅ Location set: {locationInput.lat}, {locationInput.lng}
                            </div>
                        )}

                        {/* Address */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Address (Optional)</label>
                            <textarea
                                name="address" value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Street address or landmark"
                                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                            />
                        </div>

                        {/* Info box */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(102,126,234,0.1)',
                            border: '1px solid rgba(102,126,234,0.25)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: '1.5',
                        }}>
                            <strong style={{ color: 'rgba(255,255,255,0.8)' }}>💡 Tip:</strong> Click "Use My Current Location" to auto-detect your GPS coordinates, or enter them manually.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitComplaint;
