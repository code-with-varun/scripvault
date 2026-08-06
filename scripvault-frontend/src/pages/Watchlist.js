import React, { useState, useEffect } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistService';
import { getExploreData } from '../services/exploreService';
import styles from './Watchlist.module.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function for currency formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹ --';
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--%';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  // Fetch watchlist data and available assets on component mount
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [watchlistData, exploreData] = await Promise.all([
          getWatchlist(),
          getExploreData()
        ]);
        setWatchlist(watchlistData || []);
        setAvailableAssets(exploreData || []);
      } catch (err) {
        console.error("Failed to load watchlist data:", err);
        setError("Failed to load watchlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Filter suggestions as user types
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!val.trim()) {
      setFilteredSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const query = val.toLowerCase().trim();
    const matches = availableAssets.filter(item =>
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.symbol && item.symbol.toLowerCase().includes(query)) ||
      (item.subType && item.subType.toLowerCase().includes(query))
    );

    setFilteredSuggestions(matches.slice(0, 8)); // Top 8 matches
    setShowDropdown(true);
  };

  // Handle adding a verified asset
  const handleSelectAndAddAsset = async (asset) => {
    setShowDropdown(false);
    setSearchTerm('');
    setMessage('');

    if (!asset) return;

    // Check if asset is already in user's watchlist
    const alreadyExists = watchlist.some(w => w._id === asset._id || w.symbol === asset.symbol);
    if (alreadyExists) {
      setMessage(`'${asset.name}' is already in your watchlist!`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const itemToSend = {
        symbol: asset.symbol || asset.name.substring(0, 5).toUpperCase(),
        name: asset.name,
        type: asset.type === "Mutual Funds" ? "Mutual Fund" : asset.type === "Stocks" ? "Stock" : asset.type,
        subType: asset.subType || 'N/A',
        risk: asset.risk || 'Medium Risk',
        currentPrice: asset.currentPrice || 0,
        dayChange: asset.dayChange || 0,
        oneYearReturn: asset.oneYearReturn || 0,
        threeYearReturn: asset.threeYearReturn || 0,
        fiveYearReturn: asset.fiveYearReturn || 0,
        logo: asset.logo || `https://placehold.co/40x40/FF7F27/white?text=${asset.symbol ? asset.symbol.substring(0, 4) : 'ASSET'}`,
        trendData: asset.trendData || [50, 60, 55, 70, 80]
      };

      const addedItem = await addToWatchlist(itemToSend);
      setWatchlist(prev => [...prev, addedItem]);
      setMessage(`'${addedItem.name}' added to watchlist successfully! ✅`);
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      setMessage(`Failed to add item to watchlist: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle submit from search input bar
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage("Please enter a stock or mutual fund name.");
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Attempt exact or first suggestion match from availableAssets
    const query = searchTerm.toLowerCase().trim();
    const matchedAsset = availableAssets.find(item =>
      (item.symbol && item.symbol.toLowerCase() === query) ||
      (item.name && item.name.toLowerCase() === query)
    ) || filteredSuggestions[0];

    if (!matchedAsset) {
      setMessage(`No valid stock or mutual fund found for '${searchTerm}'. Please select an available asset.`);
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    handleSelectAndAddAsset(matchedAsset);
  };

  // Handle Remove logic
  const handleRemove = async (id, name) => {
    setMessage('');
    try {
      await removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(item => item._id !== id));
      setMessage(`'${name}' removed from watchlist. 🗑️`);
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      setMessage(`Failed to remove item from watchlist: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Render elegant SVG mini sparkline chart
  const renderTrendLine = (data, isPositive) => {
    const chartValues = (data && data.length >= 2) ? data : [40, 50, 45, 60, 75];
    const maxVal = Math.max(...chartValues);
    const minVal = Math.min(...chartValues);
    const range = maxVal - minVal || 1;

    const points = chartValues.map((val, i) => {
      const x = i * (100 / (chartValues.length - 1));
      const y = 34 - ((val - minVal) / range) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <div className={styles.chartWrapper}>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={`${styles.trendChart} ${isPositive ? styles.positiveChart : styles.negativeChart}`}>
          <polyline
            fill="none"
            stroke={isPositive ? '#28a745' : '#dc3545'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.watchlistHeader}>
          <h1 className={styles.watchlistTitle}>My Watchlist</h1>
          <p className={styles.watchlistSubtitle}>Track your favorite stocks and mutual funds</p>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Search/Add Bar with Autocomplete Dropdown */}
        <div className={styles.searchWrapper}>
          <form onSubmit={handleFormSubmit} className={styles.searchBarContainer}>
            {loading ? (
              <>
                <div className={styles.skeletonInputFull}></div>
                <div className={styles.skeletonAddButton}></div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search and add available stocks, mutual funds..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onFocus={() => { if (searchTerm.trim()) setShowDropdown(true); }}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.addIcon} title="Add to Watchlist">+</button>
              </>
            )}
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && filteredSuggestions.length > 0 && (
            <div className={styles.dropdownList}>
              {filteredSuggestions.map((item) => (
                <div
                  key={item._id || item.symbol || item.name}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectAndAddAsset(item)}
                >
                  <div className={styles.dropdownItemMain}>
                    <img
                      src={item.logo || "/user-avatar.svg"}
                      alt={item.name}
                      className={styles.dropdownItemLogo}
                      onError={(e) => { e.target.onerror = null; e.target.src = "/user-avatar.svg"; }}
                    />
                    <div>
                      <div className={styles.dropdownItemName}>{item.name}</div>
                      <div className={styles.dropdownItemSub}>{item.subType || item.symbol}</div>
                    </div>
                  </div>
                  <span className={styles.assetBadge}>{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && <p className={`${styles.message} ${message.includes('successfully') || message.includes('added') ? styles.success : styles.error}`}>{message}</p>}

        {/* Watchlist Items */}
        <div className={styles.watchlistGrid}>
          {loading ? (
            // Skeleton loader for watchlist items
            [1, 2, 3].map(i => (
              <div key={i} className={styles.skeletonWatchlistItemCard}>
                <div className={styles.skeletonItemHeader}>
                  <div className={styles.skeletonTextMedium}></div>
                  <div className={styles.skeletonRemoveButton}></div>
                </div>
                <div className={styles.skeletonTextSmall}></div>
                <div className={styles.skeletonItemDetailsGrid}>
                  <div className={styles.skeletonDetailColumn}>
                    <div className={styles.skeletonTextSmall}></div>
                    <div className={styles.skeletonTextMedium}></div>
                  </div>
                  <div className={styles.skeletonDetailColumn}>
                    <div className={styles.skeletonTextSmall}></div>
                    <div className={styles.skeletonTextMedium}></div>
                  </div>
                  <div className={styles.skeletonDetailColumn}>
                    <div className={styles.skeletonTextSmall}></div>
                    <div className={styles.skeletonTextMedium}></div>
                  </div>
                  <div className={styles.skeletonDetailColumn}>
                    <div className={styles.skeletonChartSmall}></div>
                  </div>
                </div>
              </div>
            ))
          ) : watchlist.length === 0 ? (
            <p className={styles.noItemsMessage}>Your watchlist is empty. Add some available stocks or mutual funds above!</p>
          ) : (
            watchlist.map(item => {
              const change = parseFloat(item.dayChange || 0);
              const isPositive = change >= 0;
              const trendData = item.trendData || [40, 50, 45, 60, 75];

              return (
                <div key={item._id} className={styles.watchlistItemCard}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <button
                      onClick={() => handleRemove(item._id, item.name)}
                      className={styles.removeButton}
                      title="Remove from Watchlist"
                      aria-label="Remove from Watchlist"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <p className={styles.itemType}>{item.type} {item.subType ? `• ${item.subType}` : ''}</p>

                  <div className={styles.itemDetailsGrid}>
                    <div className={styles.detailColumn}>
                      <span className={styles.detailLabel}>Market Price</span>
                      <span className={styles.detailValue}>{formatCurrency(item.currentPrice)}</span>
                    </div>
                    <div className={styles.detailColumn}>
                      <span className={styles.detailLabel}>Day Change</span>
                      <span className={`${styles.detailValue} ${isPositive ? styles.positive : styles.negative}`}>
                        {isPositive ? '+' : ''}{formatPercentage(change)}
                      </span>
                    </div>
                    <div className={styles.detailColumn}>
                      <span className={styles.detailLabel}>1Y Return</span>
                      <span className={styles.detailValue}>{formatPercentage(item.oneYearReturn || 12.5)}</span>
                    </div>
                    <div className={styles.detailColumn}>
                      <span className={styles.detailLabel}>Price Trend</span>
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

export default Watchlist;
