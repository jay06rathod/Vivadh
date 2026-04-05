import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('user')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)