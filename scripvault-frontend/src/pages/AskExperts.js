import React, { useState, useEffect } from 'react';
// Assuming your service handles query submission and fetching all queries
import { submitQuery, getAllQueries } from '../services/queryService';

const AskExperts = () => {
  const [form, setForm] = useState({
    investmentType: 'General', // Default value for Investment Type
    goalType: 'General',       // New field for Goal Type
    question: ''
  });
  const [message, setMessage] = useState(''); // For success/error messages
  const [previousQueries, setPreviousQueries] = useState([]); // State for fetched previous queries
  const [loading, setLoading] = useState(true); // Loading state for previous queries
  const [error, setError] = useState(null); // Error state for previous queries

  // Helper function to calculate "time ago"
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.44); // Average days in a month
    const years = Math.round(days / 365);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  // Fetch previous queries on component mount
  useEffect(() => {
    const fetchPreviousQueries = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllQueries();
        // Sort queries by date, most recent first
        const sortedData = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date)); // Ensure data is array
        setPreviousQueries(sortedData);
      } catch (err) {
        console.error("Failed to fetch previous queries:", err);
        setError("Failed to load previous queries. Please try again later.");
        setPreviousQueries([]); // Clear queries on error
      } finally {
        setLoading(false);
      }
    };
    fetchPreviousQueries();
  }, []);

  // Handle input for the form fields
  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle query submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) {
      setMessage('Please enter your query.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      // Construct the new query object based on the form and add default pending status
      const newQuery = {
        ...form,
        status: 'Pending',
        isAnswered: false,
        expert: null,
        expertAvatar: null,
        response: "Your query is being reviewed by our experts. You'll receive a detailed response within 24 hours. Thank you for your patience!",
        // The date will be added by queryService.js
      };
      const addedQuery = await submitQuery(newQuery);
      // Add the new query to the top of the previous queries list
      setPreviousQueries(prev => [addedQuery, ...prev]);
      setMessage('Your query has been submitted! ✅');
      setForm({ investmentType: 'General', goalType: 'General', question: '' }); // Reset form
    } catch (err) {
      console.error("Failed to submit query:", err);
      setMessage("Failed to submit query. Please try again.");
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.headerRow}>
          <div style={styles.headerText}>
            <h1 style={styles.mainTitle}>Ask Our Experts</h1>
            <p style={styles.subtitle}>Get personalized investment advice from our certified financial experts</p>
          </div>
          {loading ? (
            <div style={styles.headerActions}>
              <div style={styles.skeletonButtonSmall}></div>
              <div style={styles.skeletonButtonSmall}></div>
            </div>
          ) : (
            <div style={styles.headerActions}>
              <button style={styles.adminViewButton}>⚙️ Admin View</button>
              <button style={styles.expertSupportButton}>🧑‍💻 24/7 Expert Support</button>
            </div>
          )}
        </div>

        {/* Submit Your Query Section */}
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionHeading}>
            <span style={styles.sectionIcon}>📝</span> Submit Your Query
          </h3>
          {loading ? (
            <div style={styles.form}>
              <div style={styles.inputGrid}>
                <div style={styles.skeletonInputGroup}>
                  <div style={styles.skeletonTextSmall}></div>
                  <div style={styles.skeletonSelectFull}></div>
                </div>
                <div style={styles.skeletonInputGroup}>
                  <div style={styles.skeletonTextSmall}></div>
                  <div style={styles.skeletonSelectFull}></div>
                </div>
              </div>
              <div style={styles.skeletonInputGroup}>
                <div style={styles.skeletonTextSmall}></div>
                <div style={styles.skeletonTextarea}></div>
              </div>
              <div style={styles.skeletonSubmitButton}></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGrid}>
                {/* Investment Type Dropdown */}
                <div style={styles.inputGroup}>
                  <label htmlFor="investmentType" style={styles.label}>Investment Type</label>
                  <select
                    name="investmentType"
                    id="investmentType"
                    value={form.investmentType}
                    onChange={handleInput}
                    style={styles.selectInput}
                  >
                    <option value="General">Select Investment Type</option>
                    <option value="Long-Term Investment">Long-Term Investment</option>
                    <option value="Short-Term Goals">Short-Term Goals</option>
                    <option value="Tax Saving Options">Tax Saving Options</option>
                    <option value="Retirement Planning">Retirement Planning</option>
                    <option value="Equity">Equity</option>
                    <option value="Debt">Debt</option>
                  </select>
                </div>

                {/* Goal Type Dropdown */}
                <div style={styles.inputGroup}>
                  <label htmlFor="goalType" style={styles.label}>Goal Type</label>
                  <select
                    name="goalType"
                    id="goalType"
                    value={form.goalType}
                    onChange={handleInput}
                    style={styles.selectInput}
                  >
                    <option value="General">Select Goal Type</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Child Education">Child Education</option>
                    <option value="Home Purchase">Home Purchase</option>
                    <option value="Wealth Creation">Wealth Creation</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                </div>
              </div>

              {/* Your Question Textarea */}
              <div style={styles.inputGroup}>
                <label htmlFor="question" style={styles.label}>Your Question</label>
                <textarea
                  name="question"
                  id="question"
                  rows="6" // Increased rows for more space
                  value={form.question}
                  onChange={handleInput}
                  placeholder="Describe your investment query in detail..."
                  style={styles.textarea}
                ></textarea>
              </div>

              {/* Submit Query Button */}
              <button type="submit" style={styles.submitButton}>
                <span style={styles.buttonIcon}>✉️</span> Submit Query
              </button>
            </form>
          )}
          {message && <p style={styles.message}>{message}</p>}
        </div>

        {/* Your Previous Queries Section */}
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionHeading}>
            <span style={styles.sectionIcon}>🕒</span> Your Previous Queries
          </h3>
          {loading ? (
            // Skeleton loader for previous queries
            <div style={styles.queryList}>
              {[1, 2, 3].map(i => (
                <div key={i} style={styles.skeletonQueryItemCard}>
                  <div style={styles.skeletonQueryItemHeader}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextSmall}></div>
                  </div>
                  <div style={styles.skeletonTextMedium}></div>
                  <div style={styles.skeletonQueryTags}>
                    <div style={styles.skeletonTag}></div>
                    <div style={styles.skeletonTag}></div>
                  </div>
                  <div style={styles.skeletonQueryResponse}>
                    <div style={styles.skeletonExpertInfo}>
                      <div style={styles.skeletonAvatar}></div>
                      <div style={styles.skeletonTextSmall}></div>
                    </div>
                    <div style={styles.skeletonTextareaSmall}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p style={{ ...styles.message, color: '#dc3545' }}>{error}</p>
          ) : previousQueries.length === 0 ? (
            <p style={styles.noQueriesMessage}>You have no previous queries.</p>
          ) : (
            <div style={styles.queryList}>
              {previousQueries.map(query => (
                <div key={query.id} style={styles.queryItemCard}>
                  <div style={styles.queryItemHeader}>
                    <div style={styles.queryStatus}>
                      <span style={{ color: query.isAnswered ? '#28a745' : '#FF7F27', fontWeight: 'bold' }}>
                        {query.status}
                      </span>
                      <span style={styles.queryTime}> • {timeAgo(query.date)}</span> {/* Use dynamic timeAgo */}
                    </div>
                    {!query.isAnswered && <span style={styles.pendingIcon}>⚠️</span>}
                  </div>
                  <p style={styles.queryQuestion}>{query.question}</p>
                  <div style={styles.queryTags}>
                    {query.tags && query.tags.map(tag => ( // Check if tags exist
                      <span key={tag} style={styles.queryTag}>{tag}</span>
                    ))}
                  </div>
                  <div style={styles.queryResponse}>
                    {query.isAnswered ? (
                      <div style={styles.expertResponse}>
                        <div style={styles.expertInfo}>
                          <img src={query.expertAvatar || "https://placehold.co/40x40/cccccc/white?text=EX"} alt="Expert Avatar" style={styles.expertAvatar} />
                          <span style={styles.expertName}>{query.expert || "Expert"}</span>
                        </div>
                        <p style={styles.expertText}>{query.response}</p>
                      </div>
                    ) : (
                      <p style={styles.pendingText}>{query.response}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    maxWidth: '1000px',
    margin: '0 auto',
    paddingTop: '2rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    gap: '1rem',
  },
  headerText: {
    textAlign: 'left',
  },
  mainTitle: {
    fontSize: '2.2rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end', // Align buttons to the right
  },
  adminViewButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#FF7F27', // Orange button
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  expertSupportButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#fff', // White background
    color: '#FF7F27', // Orange text
    border: '1px solid #FF7F27', // Orange border
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    '&:hover': {
      backgroundColor: '#FF7F27',
      color: '#fff',
    },
  },

  // Section Card Styles (Submit Query & Previous Queries)
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    marginBottom: '2rem', // Space between sections
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
  form: {
    width: '100%',
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Two columns for dropdowns
    gap: '1.5rem',
    marginBottom: '1.5rem',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr', // Stack on smaller screens
    },
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  selectInput: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
    '&:focus': {
      borderColor: '#FF7F27',
      boxShadow: '0 0 0 2px rgba(255, 127, 39, 0.2)',
    },
  },
  textarea: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
    minHeight: '120px', // Increased height for question
    resize: 'vertical',
    outline: 'none',
    '&:focus': {
      borderColor: '#FF7F27',
      boxShadow: '0 0 0 2px rgba(255, 127, 39, 0.2)',
    },
  },
  submitButton: {
    padding: '1rem 2rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  buttonIcon: {
    fontSize: '1.2rem',
  },
  message: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#28a745', // Green for success, adjust for error
  },

  // Previous Queries Section Styles
  queryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  queryItemCard: {
    backgroundColor: '#f9fafb', // Light background for query items
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
  },
  queryItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem',
  },
  queryStatus: {
    fontSize: '0.9rem',
    color: '#777',
  },
  queryTime: {
    fontSize: '0.85rem',
    color: '#999',
  },
  pendingIcon: {
    fontSize: '1.2rem',
    color: '#ffc107', // Yellow for pending
  },
  queryQuestion: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem',
  },
  queryTags: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  queryTag: {
    backgroundColor: '#e0e7ff', // Light blue/purple background
    color: '#4f46e5', // Darker blue/purple text
    padding: '0.3rem 0.8rem',
    borderRadius: '5px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  queryResponse: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  expertResponse: {
    backgroundColor: '#ecfdf5', // Light green background for answered queries
    borderRadius: '8px',
    padding: '1rem',
  },
  expertInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.8rem',
  },
  expertAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '10px',
    border: '2px solid #28a745', // Green border for expert
  },
  expertName: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem',
  },
  expertText: {
    fontSize: '0.95rem',
    color: '#555',
    lineHeight: '1.5',
  },
  pendingText: {
    fontSize: '0.95rem',
    color: '#777',
    fontStyle: 'italic',
  },
  noQueriesMessage: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#777',
    marginTop: '3rem',
  },

  // Skeleton Loader Styles (new and reused)
  '@keyframes pulse': {
    '0%': { backgroundColor: '#e0e0e0' },
    '50%': { backgroundColor: '#f0f0f0' },
    '100%': { backgroundColor: '#e0e0e0' },
  },
  skeletonTextLarge: {
    width: '80%',
    height: '28px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginBottom: '10px',
  },
  skeletonTextMedium: {
    width: '70%',
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginBottom: '8px',
  },
  skeletonTextSmall: {
    width: '50%',
    height: '16px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonButtonSmall: { // Reused from Dashboard
    padding: '0.6rem 1.2rem',
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    width: '150px', // Adjusted width for header buttons
    height: '35px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  skeletonSelectFull: {
    width: '100%',
    height: '45px', // Match select height
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonTextarea: {
    width: '100%',
    minHeight: '120px', // Match textarea height
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonSubmitButton: {
    width: '200px', // Match submit button width
    height: '50px', // Match submit button height
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginTop: '1.5rem',
  },
  skeletonQueryItemCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
    minHeight: '200px', // Ensure skeleton has some height
    animation: 'pulse 1.5s infinite ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  skeletonQueryItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  skeletonQueryTags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    width: '100%',
  },
  skeletonTag: {
    width: '80px',
    height: '25px',
    backgroundColor: '#d0d0d0',
    borderRadius: '5px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonQueryResponse: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  skeletonExpertInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  skeletonAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#d0d0d0',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonTextareaSmall: {
    width: '100%',
    height: '80px', // Smaller height for response text
    backgroundColor: '#d0d0d0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
};

export default AskExperts;
