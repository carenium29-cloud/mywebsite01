import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(sessionStorage.getItem('demoMode') === 'true');

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        if (isDemo) {
            const demoUser = { id: 'demo-1', email: 'demo@carenium.com', fullName: 'Dr. Demo Account', roles: ['ROLE_DOCTOR'] };
            setUser(demoUser);
            sessionStorage.setItem('user', JSON.stringify(demoUser));
            return;
        }

        const res = await axios.post('http://localhost:8080/api/auth/signin', { email, password });
        const { token, ...userData } = res.data;
        sessionStorage.setItem('token', token);
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
    };

    const adminLogin = async (email, password) => {
        const res = await axios.post('http://localhost:8080/api/auth/admin-login', { email, password });
        const { token, ...userData } = res.data;
        sessionStorage.setItem('token', token);
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, adminLogin, logout, isDemo, setIsDemo, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
