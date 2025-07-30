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
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹ --';
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--%';
    return `${parseFloat(value).toFixed(2)}%`;
  };


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

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.watchlistHeader}>
          <h1 style={styles.watchlistTitle}>My Watchlist</h1>
          <p style={styles.watchlistSubtitle}>Track your favorite stocks and mutual funds</p>
        </div>

        {error && <p style={styles.errorMessage}>{error}</p>}

        {/* Search/Add Bar */}
        <div style={styles.searchBarContainer}>
          {loading ? (
            <>
              <div style={styles.skeletonInputFull}></div>
              <div style={styles.skeletonAddButton}></div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search stocks, mutual funds..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => { if (e.key === 'Enter') handleAddOrSearch(e); }} // Allow adding on Enter
                style={styles.searchInput}
              />
              <button onClick={handleAddOrSearch} style={styles.addIcon}>+</button>
            </>
          )}
        </div>
        {message && <p style={styles.message}>{message}</p>}

        {/* Watchlist Items */}
        <div style={styles.watchlistGrid}>
          {loading ? (
            // Skeleton loader for watchlist items
            [1, 2, 3].map(i => (
              <div key={i} style={styles.skeletonWatchlistItemCard}>
                <div style={styles.skeletonItemHeader}>
                  <div style={styles.skeletonTextMedium}></div>
                  <div style={styles.skeletonRemoveButton}></div>
                </div>
                <div style={styles.skeletonTextSmall}></div> {/* For item type */}
                <div style={styles.skeletonItemDetailsGrid}>
                  <div style={styles.skeletonDetailColumn}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextMedium}></div>
                  </div>
                  <div style={styles.skeletonDetailColumn}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextMedium}></div>
                  </div>
                  <div style={styles.skeletonDetailColumn}>
                    <div style={styles.skeletonTextSmall}></div>
                    <div style={styles.skeletonTextMedium}></div>
                  </div>
                  <div style={styles.skeletonDetailColumn}>
                    <div style={styles.skeletonChartSmall}></div> {/* For trend line */}
                  </div>
                </div>
              </div>
            ))
          ) : watchlist.length === 0 ? (
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
  errorMessage: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '500',
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
  skeletonInputFull: {
    flex: 1,
    border: 'none',
    outline: 'none',
    height: '40px', // Match input height
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginRight: '1rem',
  },
  skeletonAddButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonWatchlistItemCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '150px', // Ensure skeleton has some height
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  skeletonRemoveButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonItemDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  skeletonDetailColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  skeletonChartSmall: {
    width: '80px',
    height: '40px',
    backgroundColor: '#d0d0d0',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
};

export default Watchlist;
