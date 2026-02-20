import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

const AuthContext = createContext(null);

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/auth/check/');
            if (response.data.authenticated) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await axios.post('/api/auth/login/', {
            username,
            password,
        }, {
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });
        setUser(response.data.user);
        return response.data;
    };

    const register = async (userData) => {
        const response = await axios.post('/api/auth/register/', userData, {
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        await axios.post('/api/auth/logout/', {}, {
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });
        setUser(null);
    };

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
