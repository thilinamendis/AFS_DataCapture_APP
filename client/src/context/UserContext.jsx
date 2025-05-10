import { removeItem } from "framer-motion";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('UserContext - Initial useEffect running');
        const token = localStorage.getItem('token');
        console.log('UserContext - Token exists:', !!token);
        if (token) {
            fetchUserData(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserData = async (token) => {
        console.log('UserContext - Fetching user data...');
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('UserContext - /me response status:', response.status);
            if (response.ok) {
                const userData = await response.json();
                console.log('UserContext - Received user data:', userData);
                setUser(userData);
            } else {
                console.log('UserContext - Failed to fetch user data');
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('UserContext - Error fetching user data:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        console.log('UserContext - Attempting login...');
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            console.log('UserContext - Login response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login Failed');
            }

            localStorage.setItem('token', data.token);
            console.log('UserContext - Setting user data after login:', data);
            setUser(data);

            if (data.isAdmin) {
                navigate('/admin');
            } else {
                switch (data.userType) {
                    case 'technician':
                        navigate('/technician');
                        break;
                    default:
                        navigate('/');
                }
            }
            return { success: true };
        } catch (error) {
            console.error('UserContext - Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        console.log('UserContext - Logging out...');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const updateUser = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }

            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            logout,
            register,
            updateUser
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 