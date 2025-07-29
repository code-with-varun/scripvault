import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom'; // Import NavLink and useLocation
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext provides logout
import { getUserProfile } from '../services/profileService'; // Import profile service

const Layout = () => {
  const { logout } = useAuth(); // Your original logout functionality
  const location = useLocation(); // Hook to get current location for active link styling

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState(null);

  // Fetch user profile data for avatar
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErrorProfile(null);
      try {
        const profileData = await getUserProfile();
        setUserProfile(profileData);
      } catch (err) {
        console.error("Failed to fetch user profile for layout:", err);
        setErrorProfile("Failed to load user info.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Determine active link style
  const getNavLinkStyle = ({ isActive }) => ({
    ...styles.navLink,
    ...(isActive ? styles.activeNavLink : {}),
  });

  return (
    <div style={styles.pageContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Logo */}
          <NavLink to="/dashboard" style={styles.logoLink}>
            <img src="https://assets-global.website-files.com/63f734fb25b6c647a0c249c1/64016a4b162f4b01e74a8968_logo.svg" alt="ScripVault Logo" style={styles.logoImg} />
            <span style={styles.logoText}>ScripVault</span>
          </NavLink>

          {/* Navigation Links */}
          <nav style={styles.nav}>
            <NavLink to="/dashboard" style={getNavLinkStyle}>Dashboard</NavLink>
            <NavLink to="/explore" style={getNavLinkStyle}>Explore</NavLink>
            <NavLink to="/watchlist" style={getNavLinkStyle}>Watchlist</NavLink>
            <NavLink to="/investments" style={getNavLinkStyle}>Investments</NavLink>
            <NavLink to="/ask" style={getNavLinkStyle}>Ask Experts</NavLink> {/* Using /ask as per your route */}
            <NavLink to="/profile" style={getNavLinkStyle}>Profile</NavLink>
          </nav>

          {/* User Avatar and Logout */}
          <div style={styles.userActions}>
            {loadingProfile ? (
              <div style={styles.userAvatarPlaceholder}></div> // Placeholder for loading
            ) : errorProfile ? (
              <img src="https://placehold.co/40x40/dc3545/white?text=!" alt="Error" style={styles.userAvatar} />
            ) : (
              <img src={userProfile?.profileSummary?.profilePic || "https://placehold.co/40x40/cccccc/white?text=User"} alt="User Avatar" style={styles.userAvatar} />
            )}
            <button onClick={logout} style={styles.logoutButton}>Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <Outlet /> {/* This renders the child routes (Dashboard, Profile, etc.) */}
      </main>
    </div>
  );
};

// Styles object for inline CSS
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa', // Light background for the entire page
    fontFamily: 'Poppins, sans-serif',
    display: 'flex',
    flexDirection: 'column', // Stack header and main content vertically
  },

  // Header/Top Navigation Bar Styles
  header: {
    backgroundColor: '#ffffff', // White background for the header
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Subtle shadow
    padding: '1rem 2rem',
    borderBottom: '1px solid #eee', // Light separator line
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px', // Max width for content within header
    margin: '0 auto',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    gap: '1rem', // Space between main sections of the header
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoImg: {
    height: '30px', // Adjust size as needed
    marginRight: '10px',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#FF7F27', // Orange logo text
  },
  nav: {
    display: 'flex',
    gap: '1.5rem', // Space between navigation links
    flexWrap: 'wrap', // Allow links to wrap
    '@media (max-width: 768px)': {
      width: '100%', // Take full width on smaller screens
      justifyContent: 'center',
      marginTop: '1rem',
      gap: '1rem',
    },
  },
  navLink: {
    textDecoration: 'none',
    color: '#555',
    fontWeight: '500',
    paddingBottom: '5px', // Space for active indicator if added
    transition: 'color 0.3s ease, border-bottom 0.3s ease',
    '&:hover': {
      color: '#FF7F27', // Orange on hover
    },
  },
  activeNavLink: {
    color: '#FF7F27', // Orange for active link
    borderBottom: '2px solid #FF7F27', // Underline for active link
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #FF7F27', // Orange border around avatar
  },
  userAvatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0', // Grey placeholder
    animation: 'pulse 1.5s infinite ease-in-out', // Simple loading animation
    '@keyframes pulse': {
      '0%': { opacity: 0.8 },
      '50%': { opacity: 0.5 },
      '100%': { opacity: 0.8 },
    },
  },
  logoutButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#dc3545', // Red for logout
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#c82333',
    },
  },

  // Main Content Area Styles
  mainContent: {
    flex: 1, // Takes remaining vertical space
    padding: '2rem',
    overflowY: 'auto', // Allows scrolling if content overflows
    backgroundColor: '#f5f7fa', // Matches page background
  },
};

export default Layout;
