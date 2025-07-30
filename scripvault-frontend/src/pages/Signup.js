import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { register, authMessage } = useAuth(); // Get register function and authMessage
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [localError, setLocalError] = useState(''); // For local validation errors
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Clear local error when form fields change
  useEffect(() => {
    setLocalError('');
  }, [form, agreedToTerms]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => { // Made async to await register
    e.preventDefault();

    // Enhanced validation based on UI fields
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setLocalError('Full Name, Email, Password, and Confirm Password are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) { // Basic password length validation
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreedToTerms) {
        setLocalError('You must agree to the Terms of Service and Privacy Policy.');
        return;
    }

    setLocalError(''); // Clear previous local errors

    // Prepare data for backend (only send fields that backend expects for registration)
    const registrationData = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      phone: form.phoneNumber, // Map frontend phoneNumber to backend phone
      // referralCode is not in backend User model, so don't send it unless added
    };

    // Call the register function from AuthContext
    await register(registrationData);
    // Navigation to login page is handled by AuthContext after successful registration
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.signupCard}>
        {/* Left Side: Signup Form */}
        <div style={styles.signupFormContainer}>
          {/* Logo and Headings */}
          <div style={styles.logoContainer}>
            <img src="https://assets-global.website-files.com/63f734fb25b6c647a0c249c1/64016a4b162f4b01e74a8968_logo.svg" alt="ScripVault Logo" style={styles.logoImg} />
            <h1 style={styles.logoText}>ScripVault</h1>
          </div>
          <h2 style={styles.createAccountText}>Create Your Account</h2>
          <p style={styles.investmentJourneyText}>Start your investment journey today</p>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Full Name Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="fullName" style={styles.label}>Full Name</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.icon}>👤</span> {/* Placeholder icon */}
                <input
                  name="fullName"
                  id="fullName"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.icon}>📧</span> {/* Placeholder icon */}
                <input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Phone Number Input (Optional) */}
            <div style={styles.inputGroup}>
              <label htmlFor="phoneNumber" style={styles.label}>Phone Number <span style={styles.optionalText}>(Optional)</span></label>
              <div style={styles.inputWithIcon}>
                <span style={styles.icon}>📞</span> {/* Placeholder icon */}
                <input
                  name="phoneNumber"
                  id="phoneNumber"
                  type="tel" // Use type="tel" for phone numbers
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.icon}>🔒</span> {/* Placeholder icon */}
                <input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.icon}>🔒</span> {/* Placeholder icon */}
                <input
                  name="confirmPassword"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Referral Code Input (Optional) */}
            <div style={styles.inputGroup}>
              <label htmlFor="referralCode" style={styles.label}>Referral Code <span style={styles.optionalText}>(Optional)</span></label>
              <div style={styles.inputWithIcon}>
                <span style={styles.icon}>#️⃣</span> {/* Placeholder icon */}
                <input
                  name="referralCode"
                  id="referralCode"
                  placeholder="Enter referral code"
                  value={form.referralCode}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Terms and Privacy Policy Checkbox */}
            <div style={styles.termsCheckbox}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={styles.checkbox}
                required
              />
              <label htmlFor="agreeTerms" style={styles.checkboxLabel}>
                I agree to the <Link to="/terms" style={styles.termsLink}>Terms of Service</Link> and <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
              </label>
            </div>

            {/* Error Message Display - Use localError first, then authMessage */}
            {(localError || authMessage) && (
              <p style={{ ...styles.error, color: authMessage.includes('successful') ? 'green' : 'red' }}>
                {localError || authMessage}
              </p>
            )}

            {/* Create Account Button */}
            <button type="submit" style={styles.createAccountButton}>Create Account</button>

            {/* Already have an account? Login link */}
            <p style={styles.alreadyAccount}>
              Already have an account? <Link to="/login" style={styles.loginLink}>Login</Link>
            </p>
          </form>
        </div>

        {/* Right Side: Promotional Section */}
        <div style={styles.promoSection}>
          {/* Main graphic with "Market Growth" and "Smart Investing" */}
          <div style={styles.promoImageContainer}>
            <img src="https://placehold.co/300x200/FF7F27/white?text=Market+Growth+Graphic" alt="Market Growth" style={styles.mainPromoImg} /> {/* Placeholder */}
            <div style={styles.smallPromoCardLeft}>Market Growth</div>
            <div style={styles.smallPromoCardRight}>Smart Investing</div>
          </div>

          <h2 style={styles.promoHeading}>Welcome to ScripVault</h2>
          <p style={styles.promoSubText}>Join thousands of investors who trust ScripVault for their mutual fund and stock investments. Start building your wealth with our expert-guided platform.</p>

          {/* Features List */}
          <div style={styles.promoFeaturesList}>
            <div style={styles.featureItem}>
              <span style={styles.featureCheck}>✅</span> Secure Platform
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureItem}>✅</span> Zero Commission Trading
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureItem}>✅</span> Expert Investment Advice
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureItem}>✅</span> Real-time Market Data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles object for inline CSS
const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa', // Light background for the whole page
    fontFamily: 'Poppins, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
  },
  signupCard: {
    display: 'flex',
    flexDirection: 'row', // Default to row for larger screens
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    maxWidth: '1000px', // Adjusted max-width for signup form
    width: '100%',
    backgroundColor: '#fff',
    '@media (max-width: 992px)': { // Adjust breakpoint for signup form
      flexDirection: 'column',
      maxWidth: '450px',
    },
  },
  signupFormContainer: {
    flex: 1,
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
    height: '35px',
    marginRight: '10px',
  },
  logoText: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF7F27',
    margin: 0,
  },
  createAccountText: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  investmentJourneyText: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2rem',
    fontWeight: 'normal',
  },
  form: {
    width: '100%',
    maxWidth: '350px',
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
  inputWithIcon: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '0.5rem 0.8rem', // Adjusted padding for icon
  },
  icon: {
    marginRight: '10px',
    color: '#888',
    fontSize: '1.2rem',
  },
  input: {
    flex: 1, // Allows input to take remaining space
    padding: '0.3rem 0', // Adjusted padding
    border: 'none', // Remove individual input border
    fontSize: '1rem',
    boxSizing: 'border-box', // Include padding in width
    outline: 'none', // Remove outline on focus
  },
  optionalText: {
    fontSize: '0.8rem',
    color: '#999',
    fontWeight: 'normal',
  },
  termsCheckbox: {
    display: 'flex',
    alignItems: 'flex-start', // Align text to top if it wraps
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    textAlign: 'left',
  },
  checkbox: {
    marginRight: '10px',
    marginTop: '3px', // Adjust vertical alignment
    transform: 'scale(1.1)',
  },
  checkboxLabel: {
    color: '#555',
    cursor: 'pointer',
  },
  termsLink: {
    color: '#FF7F27',
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
  createAccountButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  alreadyAccount: {
    fontSize: '0.9rem',
    color: '#555',
    marginTop: '1.5rem',
  },
  loginLink: {
    color: '#FF7F27',
    textDecoration: 'none',
    fontWeight: '600',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  // Right Side: Promotional Section Styles
  promoSection: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Light background for promo section
    borderRadius: '0 15px 15px 0', // Rounded on right side only
    padding: '3rem',
    color: '#333', // Dark text for this section
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1.5rem',
    minWidth: '300px',
    '@media (max-width: 992px)': { // Adjust breakpoint for signup form
      borderRadius: '0 0 15px 15px', // Rounded on bottom for stacked layout
      padding: '2rem',
    },
  },
  promoImageContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '350px', // Adjust max width of the image container
    marginBottom: '1rem',
  },
  mainPromoImg: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  smallPromoCardLeft: {
    position: 'absolute',
    top: '10%',
    left: '-10%',
    backgroundColor: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
  },
  smallPromoCardRight: {
    position: 'absolute',
    bottom: '10%',
    right: '-10%',
    backgroundColor: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
  },
  promoHeading: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  promoSubText: {
    fontSize: '1rem',
    lineHeight: '1.5',
    maxWidth: '350px',
    opacity: 0.9,
    marginBottom: '1.5rem',
  },
  promoFeaturesList: {
    textAlign: 'left',
    width: '100%',
    maxWidth: '300px', // Align features list
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.8rem',
    fontSize: '1rem',
    color: '#333',
  },
  featureCheck: {
    marginRight: '10px',
    fontSize: '1.2rem',
    color: '#28a745', // Green checkmark
  },
};

export default Signup;
