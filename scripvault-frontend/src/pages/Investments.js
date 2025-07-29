import React, { useEffect, useState } from 'react';
// Import your services for fetching and deleting investments
import { getInvestments, deleteInvestment } from '../services/investmentService';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [message, setMessage] = useState(''); // For success/error messages
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Helper function for currency formatting
  const formatCurrency = (value) => `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatPercentage = (value) => `${parseFloat(value).toFixed(2)}%`;

  // Fetch investments data on component mount
  useEffect(() => {
    const fetchInvestmentsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInvestments();
        // Calculate gain/loss and percentage for each item after fetching
        const processedData = data.map(item => {
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
  const totalInvested = investments.reduce((sum, item) => sum + item.investedValue, 0);
  const totalMarketValue = investments.reduce((sum, item) => sum + item.marketValue, 0);
  const overallGainLoss = totalMarketValue - totalInvested;
  const overallGainLossPercent = totalInvested > 0 ? (overallGainLoss / totalInvested) * 100 : 0;
  const isOverallPositive = overallGainLoss >= 0;

  if (loading) {
    return <p style={styles.loadingMessage}>Loading investments...</p>;
  }

  if (error) {
    return <p style={{ ...styles.loadingMessage, color: '#dc3545' }}>{error}</p>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.portfolioHeader}>
          <h1 style={styles.portfolioTitle}>My Portfolio</h1>
          <p style={styles.portfolioSubtitle}>Track your current holdings and performance</p>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        {/* Overall Portfolio Summary Card */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Overall Portfolio Performance</h3>
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
        </div>

        {/* Individual Investments Grid */}
        <div style={styles.investmentsGrid}>
          {investments.length === 0 ? (
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
};

export default Investments;
