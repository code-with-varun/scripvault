import React, { useEffect, useState } from 'react';
// Assuming these services are correctly implemented to interact with your backend
import { getUserProfile, updateUserProfile } from '../services/profileService';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Initial state for the form fields, matching profile.json structure
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    riskTolerance: 'moderate',
    preferredInvestments: {
      mutualFunds: false,
      stocks: false,
      fixedDeposits: false,
      etfs: false,
      nfos: false,
      nps: false,
    },
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    twoFactorAuth: false,
  });

  // Initial state for the right-hand summary card
  const [profileSummary, setProfileSummary] = useState({
    name: '',
    memberSince: '',
    totalInvestments: '',
    activeGoals: '',
    profilePic: 'https://placehold.co/80x80/cccccc/white?text=Profile', // Default placeholder
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfile();
        // Set form state with fetched data
        setForm(prevForm => ({
          ...prevForm,
          ...data,
          // Ensure preferredInvestments is deeply merged if it's an object
          preferredInvestments: data.preferredInvestments ? { ...prevForm.preferredInvestments, ...data.preferredInvestments } : prevForm.preferredInvestments,
        }));
        // Set profile summary state with fetched data
        setProfileSummary(data.profileSummary || {
          name: data.fullName || 'User',
          memberSince: 'N/A',
          totalInvestments: 'N/A',
          activeGoals: 'N/A',
          profilePic: 'https://placehold.co/80x80/cccccc/white?text=Profile',
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data. Please try again later.");
        // Reset to default empty states on error
        setForm({
          fullName: '', email: '', phone: '', dateOfBirth: '', address: '',
          riskTolerance: 'moderate',
          preferredInvestments: { mutualFunds: false, stocks: false, fixedDeposits: false, etfs: false, nfos: false, nps: false, },
          currentPassword: '', newPassword: '', confirmNewPassword: '', twoFactorAuth: false,
        });
        setProfileSummary({
          name: 'User', memberSince: 'N/A', totalInvestments: 'N/A', activeGoals: 'N/A',
          profilePic: 'https://placehold.co/80x80/cccccc/white?text=Profile',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('preferredInvestments.')) {
      const investmentType = name.split('.')[1];
      setForm(prevForm => ({
        ...prevForm,
        preferredInvestments: {
          ...prevForm.preferredInvestments,
          [investmentType]: checked,
        },
      }));
    } else if (type === 'checkbox') {
      setForm(prevForm => ({
        ...prevForm,
        [name]: checked,
      }));
    } else {
      setForm(prevForm => ({ ...prevForm, [name]: value }));
    }
  };

  // Handle form submission (Save Changes)
  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation for password change (if fields are filled)
    if (form.newPassword || form.confirmNewPassword) {
        if (form.newPassword !== form.confirmNewPassword) {
            setMessage('New password and confirm password do not match!');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        // Add more password validation rules here if needed (e.g., minimum length)
    }

    try {
      // Create an object with only the fields that can be updated
      const updatableForm = {
        fullName: form.fullName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        riskTolerance: form.riskTolerance,
        preferredInvestments: form.preferredInvestments,
        twoFactorAuth: form.twoFactorAuth,
      };

      // Only include password fields if they are being changed
      if (form.currentPassword && form.newPassword) {
        updatableForm.currentPassword = form.currentPassword;
        updatableForm.newPassword = form.newPassword;
      }

      const updatedProfile = await updateUserProfile(updatableForm);
      // Update the form state with the response from the service (if any changes were applied by service)
      setForm(prevForm => ({
        ...prevForm,
        ...updatedProfile,
        preferredInvestments: updatedProfile.preferredInvestments ? { ...prevForm.preferredInvestments, ...updatedProfile.preferredInvestments } : prevForm.preferredInvestments,
        // Clear password fields after successful update for security
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
      // Update profile summary with new name if changed
      setProfileSummary(prevSummary => ({
        ...prevSummary,
        name: updatedProfile.fullName || prevSummary.name,
        profilePic: updatedProfile.profileSummary?.profilePic || prevSummary.profilePic,
      }));

      setMessage('Profile updated successfully! ✅');
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage("Failed to update profile. Please try again.");
    }
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) {
    return <p style={styles.loadingMessage}>Loading profile...</p>;
  }

  if (error) {
    return <p style={{ ...styles.loadingMessage, color: '#dc3545' }}>{error}</p>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.profileHeader}>
          <h1 style={styles.profileTitle}>Profile Settings</h1>
          <p style={styles.profileSubtitle}>Manage your account information and preferences</p>
        </div>

        <div style={styles.mainContentGrid}>
          {/* Left Column: Form Sections */}
          <form onSubmit={handleSave} style={styles.formSectionsContainer}> {/* Wrap in form tag */}
            {/* Personal Information Section */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>👤</span> Personal Information
              </h3>
              <div style={styles.gridTwoColumns}>
                {/* Full Name */}
                <div style={styles.inputGroup}>
                  <label htmlFor="fullName" style={styles.label}>Full Name</label>
                  <input
                    name="fullName"
                    id="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                {/* Email Address */}
                <div style={styles.inputGroup}>
                  <label htmlFor="email" style={styles.label}>Email Address</label>
                  <input
                    name="email"
                    id="email"
                    type="email"
                    value={form.email}
                    disabled // As per original code, email is disabled
                    style={styles.inputDisabled}
                  />
                </div>
                {/* Phone Number */}
                <div style={styles.inputGroup}>
                  <label htmlFor="phone" style={styles.label}>Phone Number</label>
                  <input
                    name="phone"
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                {/* Date of Birth (Simulated) */}
                <div style={styles.inputGroup}>
                  <label htmlFor="dateOfBirth" style={styles.label}>Date of Birth</label>
                  <input
                    name="dateOfBirth"
                    id="dateOfBirth"
                    type="date" // Use type="date" for date picker
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
              {/* Address */}
              <div style={styles.inputGroup}>
                <label htmlFor="address" style={styles.label}>Address</label>
                <textarea
                  name="address"
                  id="address"
                  value={form.address}
                  onChange={handleChange}
                  style={styles.textarea}
                ></textarea>
              </div>
            </div>

            {/* Investment Preferences Section */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>📈</span> Investment Preferences
              </h3>
              {/* Risk Tolerance Radio Buttons */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Risk Tolerance</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="riskTolerance"
                      value="conservative"
                      checked={form.riskTolerance === 'conservative'}
                      onChange={handleChange}
                      style={styles.radioInput}
                    />
                    Conservative
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="riskTolerance"
                      value="moderate"
                      checked={form.riskTolerance === 'moderate'}
                      onChange={handleChange}
                      style={styles.radioInput}
                    />
                    Moderate
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="riskTolerance"
                      value="aggressive"
                      checked={form.riskTolerance === 'aggressive'}
                      onChange={handleChange}
                      style={styles.radioInput}
                    />
                    Aggressive
                  </label>
                </div>
              </div>

              {/* Preferred Investment Categories Checkboxes */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Preferred Investment Categories</label>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabelInline}>
                    <input
                      type="checkbox"
                      name="preferredInvestments.mutualFunds"
                      checked={form.preferredInvestments.mutualFunds}
                      onChange={handleChange}
                      style={styles.checkboxInput}
                    />
                    Mutual Funds
                  </label>
                  <label style={styles.checkboxLabelInline}>
                    <input
                      type="checkbox"
                      name="preferredInvestments.stocks"
                      checked={form.preferredInvestments.stocks}
                      onChange={handleChange}
                      style={styles.checkboxInput}
                    />
                    Stocks
                  </label>
                  <label style={styles.checkboxLabelInline}>
                    <input
                      type="checkbox"
                      name="preferredInvestments.etfs"
                      checked={form.preferredInvestments.etfs}
                      onChange={handleChange}
                      style={styles.checkboxInput}
                    />
                    ETFs
                  </label>
                  <label style={styles.checkboxLabelInline}>
                    <input
                      type="checkbox"
                      name="preferredInvestments.fixedDeposits"
                      checked={form.preferredInvestments.fixedDeposits}
                      onChange={handleChange}
                      style={styles.checkboxInput}
                    />
                    Fixed Deposits
                  </label>
                  <label style={styles.checkboxLabelInline}>
                    <input
                      type="checkbox"
                      name="preferredInvestments.nfos"
                      checked={form.preferredInvestments.nfos}
                      onChange={handleChange}
                      style={styles.checkboxInput}
                    />
                    NFOs
                  </label>
                  <label style={styles.checkboxLabelInline}>
                    <input
                      type="checkbox"
                      name="preferredInvestments.nps"
                      checked={form.preferredInvestments.nps}
                      onChange={handleChange}
                      style={styles.checkboxInput}
                    />
                    NPS
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings Section */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>🔐</span> Security Settings
              </h3>
              {/* Change Password Fields */}
              <div style={styles.inputGroup}>
                <label htmlFor="currentPassword" style={styles.label}>Current Password</label>
                <input
                  name="currentPassword"
                  id="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="newPassword" style={styles.label}>New Password</label>
                <input
                  name="newPassword"
                  id="newPassword"
                  type="password"
                  placeholder="Create a strong password"
                  value={form.newPassword}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="confirmNewPassword" style={styles.label}>Confirm New Password</label>
                <input
                  name="confirmNewPassword"
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmNewPassword}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Two-Factor Authentication Toggle */}
              <div style={styles.twoFactorAuthGroup}>
                <div>
                  <label htmlFor="twoFactorAuth" style={styles.label}>Two-Factor Authentication</label>
                  <p style={styles.twoFactorSubtext}>Add an extra layer of security to your account</p>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    id="twoFactorAuth"
                    checked={form.twoFactorAuth}
                    onChange={handleChange}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>
            </div>

            {/* Save Button (moved to bottom of form sections) */}
            <button type="submit" style={styles.saveButton}>Save Changes</button>
            {message && <p style={styles.message}>{message}</p>}
          </form>

          {/* Right Column: Profile Summary Card */}
          <div style={styles.profileSummaryCard}>
            <div style={styles.profilePicContainer}>
              <img src={profileSummary.profilePic} alt="Profile" style={styles.profilePic} />
            </div>
            <h3 style={styles.summaryName}>{profileSummary.name}</h3>
            <p style={styles.summaryRole}>Financial Advisor</p> {/* Hardcoded as per UI */}
            
            <div style={styles.summaryDetails}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Member Since</span>
                <span style={styles.summaryValue}>{profileSummary.memberSince}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Investments</span>
                <span style={styles.summaryValue}>{profileSummary.totalInvestments}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Active Goals</span>
                <span style={styles.summaryValue}>{profileSummary.activeGoals}</span>
              </div>
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
    backgroundColor: '#f5f7fa', // Light background
    fontFamily: 'Poppins, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '2rem', // Space for a potential fixed header
  },
  profileHeader: {
    textAlign: 'left',
    marginBottom: '2rem',
    marginLeft: '1rem', // Align with form sections
  },
  profileTitle: {
    fontSize: '2.2rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  profileSubtitle: {
    fontSize: '1rem',
    color: '#666',
  },
  mainContentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr', // Form sections wider than summary
    gap: '2rem',
    alignItems: 'flex-start', // Align items to the top
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr', // Stack columns on smaller screens
    },
  },
  formSectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem', // Space between different form cards
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
  },
  sectionHeading: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '1.5rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: '10px',
    fontSize: '1.5rem',
    color: '#FF7F27', // Orange icon color
  },
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1rem',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr', // Stack inputs on very small screens
    },
  },
  inputGroup: {
    marginBottom: '1rem',
    textAlign: 'left',
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
    boxSizing: 'border-box',
    outline: 'none',
    '&:focus': {
      borderColor: '#FF7F27',
      boxShadow: '0 0 0 2px rgba(255, 127, 39, 0.2)',
    },
  },
  inputDisabled: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #eee', // Lighter border for disabled
    backgroundColor: '#f9f9f9', // Light background for disabled
    color: '#999',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'not-allowed',
  },
  textarea: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
    minHeight: '80px', // Standard height for textarea
    resize: 'vertical', // Allow vertical resizing
    outline: 'none',
    '&:focus': {
      borderColor: '#FF7F27',
      boxShadow: '0 0 0 2px rgba(255, 127, 39, 0.2)',
    },
  },

  // Radio Group Styles
  radioGroup: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', // Light background for radio buttons
    padding: '0.8rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    border: '1px solid transparent',
    '&:has(input:checked)': { // Style when radio is checked
      backgroundColor: '#FF7F27',
      color: '#fff',
      borderColor: '#FF7F27',
    },
  },
  radioInput: {
    marginRight: '8px',
    // Hide default radio button, style custom one if needed
    appearance: 'none',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #ccc',
    backgroundColor: '#fff',
    position: 'relative',
    '&:checked': {
      borderColor: '#FF7F27', // Orange border when checked
      '&::before': { // Inner dot for checked state
        content: '""',
        width: '8px',
        height: '8px',
        backgroundColor: '#FF7F27',
        borderRadius: '50%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
    },
    // Style when parent label is checked (for text color)
    'label:has(&)': {
        color: '#333', // Default text color
    },
    'label:has(&):has(input:checked)': {
        color: '#fff', // White text when checked
    },
  },

  // Checkbox Group Styles
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  checkboxLabelInline: {
    display: 'flex',
    alignItems: 'center',
    color: '#555',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  checkboxInput: {
    marginRight: '8px',
    transform: 'scale(1.1)',
    accentColor: '#FF7F27', // Orange accent for checkbox
  },

  // Two-Factor Auth Toggle Styles
  twoFactorAuthGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #eee', // Separator line
  },
  twoFactorSubtext: {
    fontSize: '0.85rem',
    color: '#777',
    marginTop: '0.3rem',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '28px',
  },
  'switch input': { // Hide default checkbox
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.4s',
    borderRadius: '28px', // Rounded slider
    '&:before': { // Circle inside slider
      position: 'absolute',
      content: '""',
      height: '20px',
      width: '20px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
    },
  },
  'switch input:checked + .slider': {
    backgroundColor: '#FF7F27', // Orange when checked
  },
  'switch input:checked + .slider:before': {
    transform: 'translateX(22px)', // Move circle when checked
  },

  // Save Button (for the form submission)
  saveButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: '2rem', // Space from last section
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  message: {
    color: 'green',
    marginTop: '1rem',
    textAlign: 'center',
    fontSize: '0.9rem',
  },

  // Right Column: Profile Summary Card Styles
  profileSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minWidth: '280px', // Minimum width for the card
  },
  profilePicContainer: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginBottom: '1rem',
    border: '3px solid #FF7F27', // Orange border around profile pic
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee', // Fallback background
  },
  profilePic: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  summaryName: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '0.3rem',
    fontWeight: '600',
  },
  summaryRole: {
    fontSize: '0.9rem',
    color: '#777',
    marginBottom: '1.5rem',
  },
  summaryDetails: {
    width: '100%',
    borderTop: '1px solid #eee',
    paddingTop: '1.5rem',
    marginTop: '1rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.8rem',
    fontSize: '0.95rem',
    color: '#555',
  },
  summaryLabel: {
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: 'normal',
    color: '#333',
  },
};

export default Profile;
