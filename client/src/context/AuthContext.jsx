import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check for saved session on load
    useEffect(() => {
        const savedUser = localStorage.getItem('active_session');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        const foundUser = users.find(u => u.username === username && u.password === password);

        if (foundUser) {
            const sessionUser = { name: foundUser.username, ...foundUser }; // Ensure name is available
            setUser(sessionUser);
            localStorage.setItem('active_session', JSON.stringify(sessionUser));
            return true;
        }
        return false;
    };

    const register = (username, password) => {
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        if (users.find(u => u.username === username)) {
            return false; // User exists
        }

        const newUser = { id: Date.now(), username, password, name: username };
        users.push(newUser);
        localStorage.setItem('app_users', JSON.stringify(users));

        // Auto login after register
        setUser(newUser);
        localStorage.setItem('active_session', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('active_session');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
