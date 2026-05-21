import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    try {
        const stored = localStorage.getItem('user');
        if (stored && stored !== 'undefined') setUser(JSON.parse(stored));
    } catch (e) {
        localStorage.removeItem('user');
    }
    setLoading(false);
}, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });

        if (res.status === 401) {
            logout();
            window.location.href = '/login';
            return null;
        }

        return res;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);