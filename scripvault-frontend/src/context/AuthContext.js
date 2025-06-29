import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // No localStorage

  const login = (email, password) => {
    // Mocked login, you can enhance with backend later
    const dummyUser = { name: "Varun", email, token: "mock-token" };

    if (email === 'varun@gmail.com' && password === 'maruthu') {
      setUser(dummyUser);
      navigate('/dashboard'); // 🔁 Redirect after login
    } else {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
