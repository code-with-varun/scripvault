import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { logout } = useAuth();

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>📈 ScripVault</h2>
        <nav>
          <Link to="/dashboard" style={styles.navLink}>📊 Dashboard</Link>
          <Link to="/investments" style={styles.navLink}>💼 Investments</Link>
          <Link to="/watchlist" style={styles.navLink}>📋 Watchlist</Link>
          <Link to="/profile" style={styles.navLink}>👤 Profile</Link>
          <Link to="/ask" style={styles.navLink}>🙋 Ask Experts</Link>
        </nav>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '220px',
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  navLink: {
    display: 'block',
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '0.8rem',
    borderRadius: '5px',
    marginBottom: '0.5rem',
    transition: 'background 0.3s',
  },
  logout: {
    marginTop: 'auto',
    padding: '0.6rem',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
  },
};

export default Layout;
