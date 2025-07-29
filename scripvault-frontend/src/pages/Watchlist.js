import React, { useState, useEffect } from 'react';
// Assuming these services are correctly implemented to interact with your backend
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistService';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Used for the search/add input
  const [message, setMessage] = useState(''); // For success/error messages
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Helper function for currency formatting
  const formatCurrency = (value) => `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatPercentage = (value) => `${parseFloat(value).toFixed(2)}%`;


  // Fetch watchlist data on component mount
  useEffect(() => {
    const fetchWatchlistData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWatchlist();
        setWatchlist(data);
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
        setError("Failed to load watchlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlistData();
  }, []);

  // Handle input for the search/add bar
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle Add or Search logic
  const handleAddOrSearch = async (e) => {
    e.preventDefault(); // Prevent form submission if it's a form

    if (!searchTerm.trim()) {
      setMessage("Please enter a stock or mutual fund name.");
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      // Simulate adding a new item with dummy values.
      // In a real app, you'd likely search for a real item first,
      // then add its specific details.
      const newItem = {
        id: Date.now(), // Unique ID
        name: searchTerm.trim(),
        type: searchTerm.toLowerCase().includes('fund') ? 'Mutual Fund' : 'Stock', // Simple type detection
        marketPrice: parseFloat((Math.random() * 5000 + 100).toFixed(2)), // Dummy data
        changePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)), // Dummy data between -5 and +5
        investedValue: parseFloat((Math.random() * 100000 + 1000).toFixed(2)), // Dummy data
        trendData: [
          parseFloat((Math.random() * 100).toFixed(2)), parseFloat((Math.random() * 100).toFixed(2)),
          parseFloat((Math.random() * 100).toFixed(2)), parseFloat((Math.random() * 100).toFixed(2)),
          parseFloat((Math.random() * 100).toFixed(2))
        ]
      };

      const added = await addToWatchlist(newItem); // Call your service
      setWatchlist(prev => [...prev, added]);
      setSearchTerm(''); // Clear input after adding
      setMessage(`'${newItem.name}' added to watchlist! ✅`);
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      setMessage("Failed to add item to watchlist.");
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle Remove logic
  const handleRemove = async (id, name) => {
    try {
      await removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(item => item.id !== id));
      setMessage(`'${name}' removed from watchlist. 🗑️`);
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      setMessage("Failed to remove item from watchlist.");
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Helper to render the SVG trend line (simplified for demonstration)
  const renderTrendLine = (data, isPositive) => {
    if (!data || data.length < 2) return null; // Need at least 2 points
    // Scale to 0-100 SVG viewbox
    // Ensure values are within a reasonable range for scaling, or normalize them
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal;

    const points = data.map((val, i) => {
      const x = i * (100 / (data.length - 1));
      // Normalize value to 0-100, then invert y-axis for SVG (higher value = lower y)
      const y = 100 - ((val - minVal) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '80px', height: '40px' }}>
        <polyline
          fill="none"
          stroke={isPositive ? '#28a745' : '#dc3545'} // Green for positive, red for negative
          strokeWidth="3"
          points={points}
        />
      </svg>
    );
  };

  if (loading) {
    return <p style={styles.loadingMessage}>Loading watchlist...</p>;
  }

  if (error) {
    return <p style={{ ...styles.loadingMessage, color: '#dc3545' }}>{error}</p>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.watchlistHeader}>
          <h1 style={styles.watchlistTitle}>My Watchlist</h1>
          <p style={styles.watchlistSubtitle}>Track your favorite stocks and mutual funds</p>
        </div>

        {/* Search/Add Bar */}
        <div style={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Search stocks, mutual funds..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAddOrSearch(e); }} // Allow adding on Enter
            style={styles.searchInput}
          />
          <button onClick={handleAddOrSearch} style={styles.addIcon}>+</button>
        </div>
        {message && <p style={styles.message}>{message}</p>}

        {/* Watchlist Items */}
        <div style={styles.watchlistGrid}>
          {watchlist.length === 0 ? (
            <p style={styles.noItemsMessage}>Your watchlist is empty. Add some items!</p>
          ) : (
            watchlist.map(item => {
              const change = parseFloat(item.changePercent);
              const isPositive = change >= 0;
              const trendData = item.trendData || [50, 60, 40, 70, 55]; // Fallback dummy trend data

              return (
                <div key={item.id} style={styles.watchlistItemCard}>
                  <div style={styles.itemHeader}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <button onClick={() => handleRemove(item.id, item.name)} style={styles.removeButton}>
                      &times; {/* Times symbol for close/remove */}
                    </button>
                  </div>
                  <p style={styles.itemType}>{item.type}</p>
                  
                  <div style={styles.itemDetailsGrid}>
                    <div style={styles.detailColumn}>
                      <span style={styles.detailLabel}>Market Price</span>
                      <span style={styles.detailValue}>{formatCurrency(item.marketPrice)}</span>
                    </div>
                    <div style={styles.detailColumn}>
                      <span style={styles.detailLabel}>Change %</span>
                      <span style={{ ...styles.detailValue, color: isPositive ? '#28a745' : '#dc3545' }}>
                        {isPositive ? '+' : ''}{formatPercentage(item.changePercent)}
                      </span>
                    </div>
                    <div style={styles.detailColumn}>
                      <span style={styles.detailLabel}>Invested Value</span>
                      <span style={styles.detailValue}>{formatCurrency(item.investedValue)}</span>
                    </div>
                    <div style={styles.detailColumn}>
                      {renderTrendLine(trendData, isPositive)}
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
    maxWidth: '1000px',
    margin: '0 auto',
    paddingTop: '2rem',
  },
  watchlistHeader: {
    textAlign: 'left',
    marginBottom: '2rem',
    marginLeft: '1rem', // Align with search bar/cards
  },
  watchlistTitle: {
    fontSize: '2.2rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  watchlistSubtitle: {
    fontSize: '1rem',
    color: '#666',
  },

  // Search/Add Bar Styles
  searchBarContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    padding: '0.5rem 1rem',
    marginBottom: '2rem',
    maxWidth: '600px', // Limit width as per UI
    margin: '0 auto 2rem auto', // Center it
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    padding: '0.5rem 0',
    color: '#333',
  },
  addIcon: {
    backgroundColor: '#FF7F27', // Orange color
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  message: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#28a745', // Green for success, adjust for error
  },

  // Watchlist Grid/Cards Styles
  watchlistGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr', // Stack cards vertically
    gap: '1.5rem',
    marginTop: '1rem',
  },
  watchlistItemCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  itemName: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#aaa',
    fontSize: '1.5rem',
    cursor: 'pointer',
    '&:hover': {
      color: '#dc3545', // Red on hover
    },
  },
  itemType: {
    fontSize: '0.9rem',
    color: '#777',
    marginBottom: '1.5rem',
  },
  itemDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns for details
    gap: '1rem',
    alignItems: 'center', // Vertically align items in the grid
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr 1fr', // 2 columns on tablets
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr', // 1 column on mobile
    },
  },
  detailColumn: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: '#777',
    marginBottom: '0.3rem',
  },
  detailValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  noItemsMessage: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#777',
    marginTop: '3rem',
  },
};

export default Watchlist;
