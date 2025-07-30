import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, authMessage, isAuthenticated } = useAuth(); // Get authMessage and isAuthenticated
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(''); // Use local error for input validation

  // Clear local error when email/password changes
  useEffect(() => {
    setLocalError('');
  }, [email, password]);

  // Handle form submission
  const handleSubmit = async (e) => { // Made async to await login
    e.preventDefault();

    if (!email || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    setLocalError(''); // Clear previous local errors
    await login(email, password); // Call the async login function from AuthContext
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        {/* Left Side: Login Form */}
        <div style={styles.loginFormContainer}>
          {/* Logo and Tagline - UI Enhancement */}
          <div style={styles.logoContainer}>
            <img src="https://assets-global.website-files.com/63f734fb25b6c647a0c249c1/64016a4b162f4b01e74a8968_logo.svg" alt="ScripVault Logo" style={styles.logoImg} />
            <h1 style={styles.logoText}>ScripVault</h1>
          </div>
          <h2 style={styles.welcomeText}>Track. Invest. Grow.</h2>
          <h3 style={styles.welcomeBackText}>Welcome Back</h3>

          {/* Login Form - UI Enhancement for layout and labels */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Input Group */}
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Password Input Group */}
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Remember Me & Forgot Password - UI Enhancement */}
            <div style={styles.rememberForgot}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} /> Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotPassword}>Forgot Password?</Link>
            </div>

            {/* Error Message Display - Use localError first, then authMessage */}
            {(localError || authMessage) && (
              <p style={{ ...styles.error, color: authMessage.includes('successful') ? 'green' : 'red' }}>
                {localError || authMessage}
              </p>
            )}

            {/* Sign In Button - UI Enhancement */}
            <button type="submit" style={styles.signInButton}>Sign In</button>

            {/* OR Divider - UI Enhancement */}
            <div style={styles.orDivider}>
              <span style={styles.orText}>OR</span>
            </div>

            {/* Social Login Buttons - UI Enhancement (Placeholders for icons) */}
            <button type="button" style={styles.socialButton}>
              <img src="https://placehold.co/20x20/cccccc/white?text=G" alt="Google Icon" style={styles.socialIcon} /> Continue with Google
            </button>
            <button type="button" style={styles.socialButton}>
              <img src="https://placehold.co/20x20/cccccc/white?text=in" alt="LinkedIn Icon" style={styles.socialIcon} /> Continue with LinkedIn
            </button>

            {/* Create Account Link - UI Enhancement */}
            <p style={styles.newHere}>
              New here? <Link to="/signup" style={styles.createAccountLink}>Create an account</Link>
            </p>
          </form>
        </div>

        {/* Right Side: Promotional Section - Entirely New UI Section */}
        <div style={styles.promoSection}>
          <h2 style={styles.promoHeading}>Start Your Investment Journey</h2>
          <p style={styles.promoSubText}>Join thousands of investors who trust ScripVault for their financial growth</p>
          <div style={styles.promoFeaturesGrid}>
            <div style={styles.promoFeatureCard}>Real-time Tracking</div>
            <div style={styles.promoFeatureCard}>Secure Platform</div>
            <div style={styles.promoFeatureCard}>Expert Advice</div>
            <div style={styles.promoFeatureCard}>Mobile Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles object for inline CSS - Fully enhanced to match UI
const styles = {
  pageContainer: {
    minHeight: '100vh', // Full viewport height
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa', // Light background for the whole page
    fontFamily: 'Poppins, sans-serif', // Consistent font
    padding: '20px', // Add some padding for smaller screens
    boxSizing: 'border-box', // Ensure padding doesn't add to total width/height
  },
  loginCard: {
    display: 'flex',
    flexDirection: 'row', // Default to row for larger screens
    borderRadius: '15px', // Rounded corners for the main card
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', // Soft shadow
    overflow: 'hidden', // Ensures rounded corners are respected
    maxWidth: '900px', // Adjusted max-width to fit both columns well
    width: '100%', // Responsive width
    backgroundColor: '#fff', // White background for the card
    // Media query for smaller screens: stack columns vertically
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      maxWidth: '450px', // Max width for single column on mobile
    },
  },
  loginFormContainer: {
    flex: 1,
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    // Media query for smaller screens: adjust padding
    '@media (max-width: 480px)': {
      padding: '2rem',
    },
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  logoImg: {
    height: '35px', // Adjust size as per UI
    marginRight: '10px',
  },
  logoText: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF7F27', // Orange color from UI
    margin: 0,
  },
  welcomeText: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '0.5rem',
    fontWeight: 'normal',
  },
  welcomeBackText: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '2rem',
    fontWeight: '600',
  },
  form: {
    width: '100%',
    maxWidth: '350px', // Max width for the form elements within the column
  },
  inputGroup: {
    textAlign: 'left',
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box', // Include padding in width
  },
  rememberForgot: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    color: '#555',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '8px',
    transform: 'scale(1.1)',
  },
  forgotPassword: {
    color: '#FF7F27', // Orange color
    textDecoration: 'none',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  signInButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#FF7F27', // Orange button from UI
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20', // Slightly darker orange on hover
    },
  },
  orDivider: {
    position: 'relative',
    textAlign: 'center',
    margin: '1.5rem 0',
    color: '#aaa',
  },
  orText: {
    backgroundColor: '#fff',
    padding: '0 10px',
    position: 'relative',
    zIndex: 1,
  },
  // Note: Pseudo-elements like ::before cannot be directly styled with inline React styles.
  // For the line, you would typically use a div with a border or actual CSS modules.
  // This is a visual representation of how it should look.
  socialButton: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#fff',
    color: '#555',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '1rem',
    transition: 'border-color 0.3s ease',
    '&:hover': {
      borderColor: '#FF7F27', // Orange border on hover
    },
  },
  socialIcon: {
    height: '20px',
    width: '20px',
  },
  newHere: {
    fontSize: '0.9rem',
    color: '#555',
    marginTop: '1.5rem',
  },
  createAccountLink: {
    color: '#FF7F27', // Orange color
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  // Right Side: Promotional Section Styles
  promoSection: {
    flex: 1,
    backgroundColor: '#FF7F27', // Orange background from UI
    borderRadius: '0 15px 15px 0', // Rounded on right side only
    padding: '3rem',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '2rem', // Space between elements
    minWidth: '300px', // Ensure it has a minimum width
    // Media query for smaller screens: adjust border-radius and padding
    '@media (max-width: 768px)': {
      borderRadius: '0 0 15px 15px', // Rounded on bottom for stacked layout
      padding: '2rem',
    },
  },
  promoHeading: {
    fontSize: '2.2rem',
    marginBottom: '1rem',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  promoSubText: {
    fontSize: '1.1rem',
    lineHeight: '1.5',
    maxWidth: '300px',
    opacity: 0.9,
  },
  promoFeaturesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Two columns
    gap: '1.5rem', // Space between feature cards
    width: '100%',
    maxWidth: '350px',
    // Media query for very small screens: single column for features
    '@media (max-width: 400px)': {
      gridTemplateColumns: '1fr',
    },
  },
  promoFeatureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
    borderRadius: '10px',
    padding: '1.2rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '80px', // Ensure consistent height
  },
};

export default Login;
