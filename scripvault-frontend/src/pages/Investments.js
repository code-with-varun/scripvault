import React, { useEffect, useState } from 'react';
// Import your services for fetching and deleting investments
import { getInvestments, deleteInvestment } from '../services/investmentService';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [message, setMessage] = useState(''); // For success/error messages
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Helper function for currency formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹ --';
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--%';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  // Fetch investments data on component mount
  useEffect(() => {
    const fetchInvestmentsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInvestments();
        // Calculate gain/loss and percentage for each item after fetching
        const processedData = (data || []).map(item => { // Ensure data is an array
          const gainLoss = item.marketValue - item.investedValue;
          const gainLossPercent = item.investedValue > 0 ? (gainLoss / item.investedValue) * 100 : 0;
          return {
            ...item,
            gainLoss: gainLoss,
            gainLossPercent: gainLossPercent,
          };
        });
        setInvestments(processedData);
      } catch (err) {
        console.error("Failed to fetch investments:", err);
        setError("Failed to load investments. Please try again later.");
        setInvestments([]); // Clear investments on error
      } finally {
        setLoading(false);
      }
    };
    fetchInvestmentsData();
  }, []);

  // Handle Delete logic
  const handleDelete = async (id, name) => {
    try {
      await deleteInvestment(id); // Call your service
      setInvestments(prev => prev.filter(item => item.id !== id));
      setMessage(`'${name}' removed from portfolio. 🗑️`);
    } catch (err) {
      console.error("Failed to delete investment:", err);
      setMessage("Failed to remove investment from portfolio.");
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Calculate overall portfolio summary
  // Ensure investments is an array before calling reduce
  const totalInvested = (investments || []).reduce((sum, item) => sum + item.investedValue, 0);
  const totalMarketValue = (investments || []).reduce((sum, item) => sum + item.marketValue, 0);
  const overallGainLoss = totalMarketValue - totalInvested;
  const overallGainLossPercent = totalInvested > 0 ? (overallGainLoss / totalInvested) * 100 : 0;
  const isOverallPositive = overallGainLoss >= 0;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.portfolioHeader}>
          <h1 style={styles.portfolioTitle}>My Portfolio</h1>
          <p style={styles.portfolioSubtitle}>Track your current holdings and performance</p>
        </div>

        {error && <p style={styles.errorMessage}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        {/* Overall Portfolio Summary Card */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Overall Portfolio Performance</h3>
          {loading ? (
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <div style={styles.skeletonTextSmall}></div>
                <div style={styles.skeletonTextMedium}></div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.skeletonTextSmall}></div>
                <div style={styles.skeletonTextMedium}></div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.skeletonTextSmall}></div>
                <div style={styles.skeletonTextMedium}></div>
              </div>
            </div>
          ) : (
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Invested</span>
                <span style={styles.summaryValue}>{formatCurrency(totalInvested)}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Current Value</span>
                <span style={styles.summaryValue}>{formatCurrency(totalMarketValue)}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Gain/Loss</span>
                <span style={{ ...styles.summaryValue, color: isOverallPositive ? '#28a745' : '#dc3545' }}>
                  {overallGainLoss >= 0 ? '+' : ''}{formatCurrency(overallGainLoss)} ({formatPercentage(overallGainLossPercent)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Individual Investments Grid */}
        <div style={styles.investmentsGrid}>
          {loading ? (
            // Skeleton loader for individual investment cards
            [1, 2, 3, 4].map(i => (
              <div key={i} style={styles.skeletonInvestmentCard}>
                <div style={styles.skeletonCardHeader}>
                  <div style={styles.skeletonCircle}></div>
                  <div style={styles.skeletonTextGroup}>
                    <div style={styles.skeletonTextMedium}></div>
                    <div style={styles.skeletonTextSmall}></div>
                  </div>
                  <div style={styles.skeletonRemoveButton}></div>
                </div>
                <div style={styles.skeletonCardDetailsGrid}>
                  <div style={styles.skeletonDetailItem}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextMedium}></div>
                  </div>
                  <div style={styles.skeletonDetailItem}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextMedium}></div>
                  </div>
                  <div style={styles.skeletonDetailItem}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextMedium}></div>
                  </div>
                </div>
              </div>
            ))
          ) : investments.length === 0 ? (
            <p style={styles.noInvestmentsMessage}>You have no investments in your portfolio. Start exploring!</p>
          ) : (
            investments.map(item => {
              const isPositive = item.gainLoss >= 0;
              return (
                <div key={item.id} style={styles.investmentCard}>
                  <div style={styles.cardHeader}>
                    <img src={item.logo} alt={`${item.name} Logo`} style={styles.cardLogo} />
                    <div>
                      <h3 style={styles.cardTitle}>{item.name}</h3>
                      <p style={styles.cardSubtitle}>{item.type} ({item.frequency})</p>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.name)} style={styles.deleteButton}>
                      &times; {/* Times symbol for close/remove */}
                    </button>
                  </div>

                  <div style={styles.cardDetailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Invested</span>
                      <span style={styles.detailValue}>{formatCurrency(item.investedValue)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Market Value</span>
                      <span style={styles.detailValue}>{formatCurrency(item.marketValue)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Gain/Loss</span>
                      <span style={{ ...styles.detailValue, color: isPositive ? '#28a745' : '#dc3545' }}>
                        {item.gainLoss >= 0 ? '+' : ''}{formatCurrency(item.gainLoss)} ({formatPercentage(item.gainLossPercent)})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
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
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '2rem',
  },
  portfolioHeader: {
    textAlign: 'left',
    marginBottom: '2rem',
    marginLeft: '1rem', // Align with content
  },
  portfolioTitle: {
    fontSize: '2.2rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  portfolioSubtitle: {
    fontSize: '1rem',
    color: '#666',
  },
  errorMessage: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '500',
  },
  message: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#28a745', // Green for success, adjust for error
    marginBottom: '1rem',
  },

  // Overall Summary Card Styles
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    marginBottom: '2rem',
    textAlign: 'center', // Center the title
  },
  summaryTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1.5rem',
    fontWeight: '600',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive columns
    gap: '1.5rem',
    justifyContent: 'center',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb', // Lighter background for items
    borderRadius: '10px',
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: '#777',
    marginBottom: '0.5rem',
  },
  summaryValue: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#333',
  },

  // Individual Investments Grid/Cards Styles
  investmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Responsive grid
    gap: '1.5rem',
    marginTop: '1rem',
  },
  investmentCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    position: 'relative', // For absolute positioning of delete button
  },
  cardLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 0.2rem 0',
    textAlign: 'left',
  },
  cardSubtitle: {
    fontSize: '0.9rem',
    color: '#777',
    margin: 0,
    textAlign: 'left',
  },
  deleteButton: {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#aaa',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '5px', // Add padding for easier click
    '&:hover': {
      color: '#dc3545', // Red on hover
    },
  },
  cardDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Two columns for details
    gap: '1rem',
    marginBottom: '1rem',
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr', // Stack on mobile
    },
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#777',
    marginBottom: '0.2rem',
  },
  detailValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  noInvestmentsMessage: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#777',
    marginTop: '3rem',
    gridColumn: '1 / -1', // Span across all columns
  },

  // Skeleton Loader Styles (reused and new)
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
  skeletonCircle: {
    width: '40px',
    height: '40px',
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonSummaryCard: { // For the overall summary card
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    marginBottom: '2rem',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonInvestmentCard: { // For individual investment cards
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '200px', // Ensure skeleton has some height
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    position: 'relative',
    width: '100%',
  },
  skeletonTextGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  skeletonRemoveButton: {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonCardDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
  },
  skeletonDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
};

export default Investments;
