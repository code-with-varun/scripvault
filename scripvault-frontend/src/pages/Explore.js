import React, { useState, useEffect } from 'react';
import { addToWatchlist } from '../services/watchlistService';
import { getExploreData } from '../services/exploreService'; // Import the new service

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterCAGR, setFilterCAGR] = useState('CAGR %');
  const [filterRisk, setFilterRisk] = useState('Risk Level');
  const [activeCategory, setActiveCategory] = useState('Mutual Funds');
  const [sortOption, setSortOption] = useState('Sort by Performance');
  const [exploreResults, setExploreResults] = useState([]);
  const [allExploreData, setAllExploreData] = useState([]); // Store all fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isGridView, setIsGridView] = useState(true); // State for view toggle

  // Fetch data on component mount
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getExploreData();
        setAllExploreData(data); // Store the full dataset
        // Initialize filtered results based on default activeCategory
        setExploreResults(data.filter(item => item.type === activeCategory));
      } catch (err) {
        console.error("Error fetching explore data:", err);
        setError("Failed to load investment data. Please try again later.");
        setAllExploreData([]);
        setExploreResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, []); // Run once on component mount

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    if (loading || error) {
      return; // Do not filter/sort if still loading or in error state
    }

    let currentFilteredData = allExploreData;

    // Filter by active category tab
    if (activeCategory !== 'All') { // Assuming 'All' would be an option if you want to show everything
      currentFilteredData = currentFilteredData.filter(item => item.type === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      currentFilteredData = currentFilteredData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subType && item.subType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected type (from dropdown)
    if (filterType !== 'All Types') {
      currentFilteredData = currentFilteredData.filter(item => item.type === filterType);
    }

    // Filter by risk level
    if (filterRisk !== 'Risk Level') {
      currentFilteredData = currentFilteredData.filter(item => item.risk === filterRisk);
    }

    // Filter by CAGR (for Mutual Funds)
    if (filterCAGR !== 'CAGR %') {
      currentFilteredData = currentFilteredData.filter(item => {
        if (item.type === 'Mutual Funds' && item.oneYearCAGR) {
          const cagrValue = parseFloat(item.oneYearCAGR.replace('%', ''));
          const minCagr = parseFloat(filterCAGR.replace('%+', ''));
          return cagrValue >= minCagr;
        }
        return true; // Don't filter other types by CAGR
      });
    }

    // Apply sorting
    currentFilteredData.sort((a, b) => {
      if (sortOption === 'Sort by Performance') {
        // Handle different performance metrics based on type
        const getPerformance = (item) => {
          if (item.type === 'Mutual Funds' && item.oneYearCAGR) return parseFloat(item.oneYearCAGR.replace('%', ''));
          if (item.type === 'Stocks' && item.oneYearReturn) return parseFloat(item.oneYearReturn.replace('%', ''));
          if (item.type === 'ETFs' && item.oneYearReturn) return parseFloat(item.oneYearReturn.replace('%', ''));
          return 0; // Default to 0 if no relevant performance metric
        };
        return getPerformance(b) - getPerformance(a); // Descending performance
      } else if (sortOption === 'Sort by Name (A-Z)') {
        return a.name.localeCompare(b.name);
      }
      // Add other sorting logic (e.g., AUM, if data is available)
      return 0;
    });

    setExploreResults(currentFilteredData);
  }, [searchTerm, filterType, filterCAGR, filterRisk, activeCategory, sortOption, allExploreData, loading, error]);


  const handleAddToWatchlist = async (item) => {
    try {
      // Assuming watchlistService.js is correctly set up with direct import or backend call
      // You might need to adjust the item structure sent to watchlistService
      await addToWatchlist(item);
      setMessage(`'${item.name}' added to watchlist! ✅`);
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      setMessage("Failed to add to watchlist.");
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddToPortfolio = (item) => {
    setMessage(`'${item.name}' added to portfolio (simulated)!`);
    console.log('Add to portfolio:', item);
    // In a real app, you'd send this to a backend service to update the user's portfolio
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <p style={styles.loadingMessage}>Loading investments...</p>;
  }

  if (error) {
    return <p style={{ ...styles.loadingMessage, color: '#dc3545' }}>{error}</p>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <div style={styles.exploreHeader}>
          <h1 style={styles.exploreTitle}>Explore Investments</h1>
          <p style={styles.exploreSubtitle}>Discover stocks, mutual funds, and investment opportunities</p>
        </div>

        {/* Search and Filter Bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search stocks, mutual funds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={styles.filterSelect}>
            <option>All Types</option>
            <option>Mutual Funds</option>
            <option>Stocks</option>
            <option>ETFs</option>
            <option>NFOs</option>
            {/* <option>NPS</option> // NPS is not in your explore.json, consider adding if needed */}
          </select>
          <select value={filterCAGR} onChange={(e) => setFilterCAGR(e.target.value)} style={styles.filterSelect}>
            <option>CAGR %</option>
            <option>5%+</option>
            <option>10%+</option>
            <option>15%+</option>
          </select>
          <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} style={styles.filterSelect}>
            <option>Risk Level</option>
            <option>Low Risk</option>
            <option>Medium Risk</option>
            <option>High Risk</option>
          </select>
          <button style={styles.filterButton}>Filter</button>
        </div>

        {/* Category Tabs */}
        <div style={styles.categoryTabs}>
          <button
            style={activeCategory === 'Mutual Funds' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveCategory('Mutual Funds')}
          >
            Mutual Funds
          </button>
          <button
            style={activeCategory === 'Stocks' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveCategory('Stocks')}
          >
            Stocks
          </button>
          <button
            style={activeCategory === 'NFOs' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveCategory('NFOs')}
          >
            NFOs
          </button>
          <button
            style={activeCategory === 'ETFs' ? styles.activeTab : styles.tabButton}
            onClick={() => setActiveCategory('ETFs')}
          >
            ETFs
          </button>
        </div>

        {message && <p style={styles.message}>{message}</p>}

        {/* Results Header */}
        <div style={styles.resultsHeader}>
          <span style={styles.resultsCount}>{exploreResults.length} Results</span>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={styles.sortSelect}>
            <option>Sort by Performance</option>
            <option>Sort by Name (A-Z)</option>
            {/* Add more sorting options like 'Sort by AUM' if AUM data is available */}
          </select>
          {/* Grid/List Toggle Button */}
          <button onClick={() => setIsGridView(!isGridView)} style={styles.toggleViewButton}>
            {isGridView ? '☰' : '▦'}
          </button>
        </div>

        {/* Investment Cards Grid/List */}
        <div style={isGridView ? styles.investmentCardsGrid : styles.investmentCardsList}>
          {exploreResults.length === 0 ? (
            <p style={styles.noResultsMessage}>No investments found matching your criteria.</p>
          ) : (
            exploreResults.map(item => (
              <div key={item.id} style={isGridView ? styles.investmentCard : styles.investmentListItem}>
                {/* Common header for both views */}
                <div style={isGridView ? styles.cardHeader : styles.listItemHeader}>
                  <img src={item.logo} alt={`${item.name} Logo`} style={styles.cardLogo} />
                  <div style={styles.listItemNameAndSubtype}>
                    <h3 style={styles.cardTitle}>{item.name}</h3>
                    <p style={styles.cardSubtitle}>{item.subType}</p>
                  </div>
                  <span style={{ ...styles.riskTag, backgroundColor: item.risk === 'Low Risk' ? '#d4edda' : item.risk === 'Medium Risk' ? '#fff3cd' : '#f8d7da', color: item.risk === 'Low Risk' ? '#155724' : item.risk === 'Medium Risk' ? '#856404' : '#721c24' }}>
                    {item.risk}
                  </span>
                </div>

                {/* Dynamic content based on type (Mutual Fund vs. Stock vs. NFO vs. ETF) */}
                {isGridView ? ( // Grid View Details
                  item.type === 'Mutual Funds' ? (
                    <div style={styles.cardDetailsGrid}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Market Value</span>
                        <span style={styles.detailValue}>{item.marketValue}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Invested</span>
                        <span style={styles.detailValue}>{item.investedValue}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>1Y CAGR</span>
                        <span style={styles.detailValue}>{item.oneYearCAGR}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>3Y CAGR</span>
                        <span style={styles.detailValue}>{item.threeYearCAGR}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>5Y CAGR</span>
                        <span style={styles.detailValue}>{item.fiveYearCAGR}</span>
                      </div>
                    </div>
                  ) : item.type === 'Stocks' ? (
                    <div style={styles.cardDetailsGrid}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Current Price</span>
                        <span style={styles.detailValue}>{item.currentPrice}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Day Change</span>
                        <span style={{ ...styles.detailValue, color: parseFloat(item.dayChange) >= 0 ? '#28a745' : '#dc3545' }}>{item.dayChange}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>1Y Return</span>
                        <span style={styles.detailValue}>{item.oneYearReturn}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>3Y Return</span>
                        <span style={styles.detailValue}>{item.threeYearReturn}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>5Y Return</span>
                        <span style={styles.detailValue}>{item.fiveYearReturn}</span>
                      </div>
                    </div>
                  ) : item.type === 'NFOs' ? (
                    <div style={styles.cardDetailsGrid}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Issue Price</span>
                        <span style={styles.detailValue}>{item.issuePrice}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Open Date</span>
                        <span style={styles.detailValue}>{item.openDate}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Close Date</span>
                        <span style={styles.detailValue}>{item.closeDate}</span>
                      </div>
                    </div>
                  ) : item.type === 'ETFs' ? (
                    <div style={styles.cardDetailsGrid}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Current Price</span>
                        <span style={styles.detailValue}>{item.currentPrice}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Day Change</span>
                        <span style={{ ...styles.detailValue, color: parseFloat(item.dayChange) >= 0 ? '#28a745' : '#dc3545' }}>{item.dayChange}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Expense Ratio</span>
                        <span style={styles.detailValue}>{item.expenseRatio}</span>
                      </div>
                    </div>
                  ) : null
                ) : ( // List View Details - New Structure
                  <div style={styles.listItemDetails}>
                    {item.type === 'Mutual Funds' ? (
                      <>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Market Value</span>
                          <span style={styles.detailValue}>{item.marketValue}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Invested</span>
                          <span style={styles.detailValue}>{item.investedValue}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>1Y CAGR</span>
                          <span style={styles.detailValue}>{item.oneYearCAGR}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>3Y CAGR</span>
                          <span style={styles.detailValue}>{item.threeYearCAGR}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>5Y CAGR</span>
                          <span style={styles.detailValue}>{item.fiveYearCAGR}</span>
                        </div>
                      </>
                    ) : item.type === 'Stocks' ? (
                      <>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Current Price</span>
                          <span style={styles.detailValue}>{item.currentPrice}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Day Change</span>
                          <span style={{ ...styles.detailValue, color: parseFloat(item.dayChange) >= 0 ? '#28a745' : '#dc3545' }}>{item.dayChange}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>1Y Return</span>
                          <span style={styles.detailValue}>{item.oneYearReturn}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>3Y Return</span>
                          <span style={styles.detailValue}>{item.threeYearReturn}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>5Y Return</span>
                          <span style={styles.detailValue}>{item.fiveYearReturn}</span>
                        </div>
                      </>
                    ) : item.type === 'NFOs' ? (
                      <>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Issue Price</span>
                          <span style={styles.detailValue}>{item.issuePrice}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Open Date</span>
                          <span style={styles.detailValue}>{item.openDate}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Close Date</span>
                          <span style={styles.detailValue}>{item.closeDate}</span>
                        </div>
                      </>
                    ) : item.type === 'ETFs' ? (
                      <>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Current Price</span>
                          <span style={styles.detailValue}>{item.currentPrice}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Day Change</span>
                          <span style={{ ...styles.detailValue, color: parseFloat(item.dayChange) >= 0 ? '#28a745' : '#dc3545' }}>{item.dayChange}</span>
                        </div>
                        <div style={styles.listItemDetailColumn}>
                          <span style={styles.detailLabel}>Expense Ratio</span>
                          <span style={styles.detailValue}>{item.expenseRatio}</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Actions for both views */}
                <div style={isGridView ? styles.cardActions : styles.listItemActions}>
                  <button onClick={() => handleAddToWatchlist(item)} style={styles.addToWatchlistButton}>Add to Watchlist</button>
                  <button onClick={() => handleAddToPortfolio(item)} style={styles.addToButton}>Add to</button>
                </div>
              </div>
            ))
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
    backgroundColor: '#f5f7fa',
    fontFamily: 'Poppins, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '2rem',
  },
  exploreHeader: {
    textAlign: 'left',
    marginBottom: '2rem',
    marginLeft: '1rem',
  },
  exploreTitle: {
    fontSize: '2.2rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  exploreSubtitle: {
    fontSize: '1rem',
    color: '#666',
  },

  // Filter Bar Styles
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    padding: '1.5rem',
    marginBottom: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    flexGrow: 1,
    maxWidth: '300px',
  },
  searchIcon: {
    marginRight: '10px',
    color: '#888',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    flex: 1,
    padding: '0.2rem 0',
  },
  filterSelect: {
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '120px',
  },
  filterButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },

  // Category Tabs Styles
  categoryTabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tabButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#fff',
    color: '#555',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    '&:hover': {
      borderColor: '#FF7F27',
    },
  },
  activeTab: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: '1px solid #FF7F27', // Corrected line
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },

  message: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#28a745',
    marginBottom: '1rem',
  },

  // Results Header (Count and Sort)
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  resultsCount: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  sortSelect: {
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
  },
  toggleViewButton: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#555',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    '&:hover': {
      borderColor: '#FF7F27',
    },
  },

  // Investment Cards Grid/List Styles
  investmentCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  investmentCardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
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
  investmentListItem: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute items horizontally
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    gap: '1rem', // Space between main sections in list item
  },
  // New styles for list item layout
  listItemHeader: { // For logo, name, subtype, risk tag in list view
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: '1 1 250px', // Allow this section to grow/shrink, min width 250px
    minWidth: '200px', // Ensure it doesn't get too small
  },
  listItemNameAndSubtype: {
    flex: 1, // Allow name/subtype to take available space
  },
  listItemDetails: { // For the market value, invested, CAGR etc. in list view
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem', // Space between detail columns
    flex: '2 1 400px', // Allow this section to grow/shrink, min width 400px
    justifyContent: 'flex-start', // Align details to the start
    '@media (max-width: 768px)': {
      flex: '1 1 100%', // Take full width on smaller screens
      justifyContent: 'space-around', // Distribute evenly
      order: 1, // Place details below header on small screens
    },
  },
  listItemDetailColumn: { // Individual detail item within list view
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    minWidth: '80px', // Minimum width for each detail column
  },
  listItemActions: { // For buttons in list view
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end', // Align buttons to the right
    flex: '1 1 200px', // Allow actions to grow/shrink, min width 200px
    '@media (max-width: 768px)': {
      flex: '1 1 100%', // Take full width on smaller screens
      justifyContent: 'center', // Center buttons
      order: 2, // Place actions below details on small screens
    },
  },

  // Existing styles (adjusted where necessary for consistency)
  cardHeader: { // Used for grid view
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
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
  riskTag: {
    marginLeft: 'auto',
    padding: '0.3rem 0.8rem',
    borderRadius: '5px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  cardDetailsGrid: { // Used for grid view
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
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
  cardActions: { // Used for grid view
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  addToWatchlistButton: {
    padding: '0.8rem 1.2rem',
    backgroundColor: '#fff',
    color: '#FF7F27',
    border: '1px solid #FF7F27',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    '&:hover': {
      backgroundColor: '#FF7F27',
      color: '#fff',
    },
  },
  addToButton: {
    padding: '0.8rem 1.2rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  noResultsMessage: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#777',
    marginTop: '3rem',
    gridColumn: '1 / -1',
  },
};

export default Explore;
