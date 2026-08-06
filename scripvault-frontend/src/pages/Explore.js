import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { addToWatchlist } from '../services/watchlistService';
import { addInvestment, getInvestments } from '../services/investmentService';
import { getExploreData } from '../services/exploreService';
import styles from './Explore.module.css';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterCAGR, setFilterCAGR] = useState('CAGR %');
  const [filterRisk, setFilterRisk] = useState('Risk Level');
  const [activeCategory, setActiveCategory] = useState('Mutual Fund');
  const [sortOption, setSortOption] = useState('Sort by Performance');
  const [exploreResults, setExploreResults] = useState([]);
  const [allExploreData, setAllExploreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isGridView, setIsGridView] = useState(true);

  // State for Invest Modal
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [stockQuantity, setStockQuantity] = useState(1);
  const [investmentFrequency, setInvestmentFrequency] = useState('one-time');

  // Helper to map frontend category names (plural) to backend model types (singular) for filtering
  const mapFrontendCategoryToBackendType = useCallback((category) => {
    switch (category) {
      case 'Mutual Funds': return 'Mutual Fund';
      case 'Stocks': return 'Stock';
      case 'NFOs': return 'NFO';
      case 'ETFs': return 'ETF';
      default: return category;
    }
  }, []);

  // Check URL query parameters for category filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category') || params.get('type');
    if (categoryParam) {
      if (categoryParam.toUpperCase() === 'FD' || categoryParam.toUpperCase() === 'FIXED DEPOSIT') {
        setFilterType('All Types');
        setActiveCategory('Mutual Fund');
      } else if (categoryParam.toUpperCase() === 'STOCK' || categoryParam.toUpperCase() === 'STOCKS') {
        setActiveCategory('Stock');
      } else if (categoryParam.toUpperCase() === 'MUTUAL FUND' || categoryParam.toUpperCase() === 'MUTUAL FUNDS') {
        setActiveCategory('Mutual Fund');
      } else if (categoryParam.toUpperCase() === 'ETF' || categoryParam.toUpperCase() === 'ETFS') {
        setActiveCategory('ETF');
      } else if (categoryParam.toUpperCase() === 'NFO' || categoryParam.toUpperCase() === 'NFOS') {
        setActiveCategory('NFO');
      }
    }
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialExploreData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, userInvs] = await Promise.all([
          getExploreData(),
          getInvestments().catch(() => [])
        ]);

        const investmentsList = userInvs || [];

        // Map invested amounts from user investments onto explore data
        const enrichedData = data.map(item => {
          const invMatch = investmentsList.find(i =>
            (i.symbol && item.symbol && i.symbol.toUpperCase() === item.symbol.toUpperCase()) ||
            (i.name && item.name && i.name.toLowerCase() === item.name.toLowerCase())
          );
          return {
            ...item,
            investedValue: invMatch ? (invMatch.investedValue || invMatch.amount || 0) : 0
          };
        });

        setAllExploreData(enrichedData);

        // Initialize filtered results based on default activeCategory
        const backendCat = mapFrontendCategoryToBackendType(activeCategory);
        const initialFiltered = enrichedData.filter(item => item.type === backendCat);
        setExploreResults(initialFiltered);
      } catch (err) {
        console.error("Error fetching explore data:", err);
        setError("Failed to load investment data. Please try again later.");
        setAllExploreData([]);
        setExploreResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialExploreData();
  }, [activeCategory, mapFrontendCategoryToBackendType]);

  // Real-time SSE price update stream connection
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/api/explore/stream');

    eventSource.onmessage = (event) => {
      try {
        const updates = JSON.parse(event.data);
        const updateMap = new Map(updates.map(u => [u.id || u.symbol, u]));

        setAllExploreData(prevData =>
          prevData.map(item => {
            const upd = updateMap.get(item._id) || updateMap.get(item.symbol);
            if (upd) {
              return {
                ...item,
                currentPrice: upd.currentPrice,
                dayChange: upd.dayChange,
                isLive: true
              };
            }
            return item;
          })
        );
      } catch (err) {
        console.error('Error parsing SSE stream message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Stream connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    if (loading || error) {
      return;
    }

    let currentFilteredData = [...allExploreData];

    // Filter by active category tab
    const backendActiveCategory = mapFrontendCategoryToBackendType(activeCategory);
    if (backendActiveCategory !== 'All') {
      currentFilteredData = currentFilteredData.filter(item => item.type === backendActiveCategory);
    }

    // Filter by search term
    if (searchTerm) {
      currentFilteredData = currentFilteredData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.symbol && item.symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subType && item.subType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected type
    const backendFilterType = mapFrontendCategoryToBackendType(filterType);
    if (backendFilterType !== 'All Types') {
      currentFilteredData = currentFilteredData.filter(item => item.type === backendFilterType);
    }

    // Filter by risk level
    if (filterRisk !== 'Risk Level') {
      currentFilteredData = currentFilteredData.filter(item => item.risk === filterRisk);
    }

    // Filter by CAGR/Return
    if (filterCAGR !== 'CAGR %') {
      const minReturn = parseFloat(filterCAGR.replace('%+', ''));
      currentFilteredData = currentFilteredData.filter(item => {
        let itemReturn = 0;
        if (item.type === 'Mutual Fund' || item.type === 'ETF' || item.type === 'Stock') {
          itemReturn = item.oneYearReturn || 0;
        }
        return itemReturn >= minReturn;
      });
    }

    // Apply sorting
    currentFilteredData.sort((a, b) => {
      if (sortOption === 'Sort by Performance') {
        const getPerformance = (item) => {
          if (item.type === 'Mutual Fund' || item.type === 'ETF' || item.type === 'Stock') return item.oneYearReturn || 0;
          return 0;
        };
        return getPerformance(b) - getPerformance(a);
      } else if (sortOption === 'Sort by Name (A-Z)') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'Price: Low to High') {
        return (parseFloat(a.currentPrice) || 0) - (parseFloat(b.currentPrice) || 0);
      } else if (sortOption === 'Price: High to Low') {
        return (parseFloat(b.currentPrice) || 0) - (parseFloat(a.currentPrice) || 0);
      }
      return 0;
    });

    setExploreResults(currentFilteredData);
  }, [searchTerm, filterType, filterCAGR, filterRisk, activeCategory, sortOption, allExploreData, loading, error, mapFrontendCategoryToBackendType]);


  const handleAddToWatchlist = async (item) => {
    setMessage('');
    try {
      const itemToSend = {
        symbol: item.symbol,
        name: item.name,
        type: item.type,
        subType: item.subType,
        risk: item.risk,
        currentPrice: item.currentPrice,
        dayChange: item.dayChange,
        oneYearReturn: item.oneYearReturn,
        threeYearReturn: item.threeYearReturn,
        fiveYearReturn: item.fiveYearReturn,
        logo: item.logo,
        trendData: item.trendData || []
      };
      await addToWatchlist(itemToSend);
      setMessage(`'${item.name}' added to watchlist successfully! ✅`);
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      setMessage(`Failed to add to watchlist: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Invest Modal Handlers
  const handleOpenInvestModal = (item) => {
    setSelectedItem(item);
    setShowInvestModal(true);
    setInvestmentAmount('');
    setStockQuantity(1);
    setInvestmentFrequency('one-time');
    setMessage('');
  };

  const handleCloseInvestModal = () => {
    setTimeout(() => {
      setShowInvestModal(false);
      setSelectedItem(null);
    }, 50);
  };

  const handleInvest = async () => {
    if (!selectedItem) return;

    setMessage('');
    try {
      let validObjectType = selectedItem.type;
      if (validObjectType === 'Mutual Funds') validObjectType = 'Mutual Fund';
      if (validObjectType === 'Stocks') validObjectType = 'Stock';
      if (validObjectType === 'ETFs') validObjectType = 'ETF';
      if (validObjectType === 'NFOs') validObjectType = 'NFO';

      const isStockOrETF = validObjectType === 'Stock' || validObjectType === 'ETF';

      if (isStockOrETF) {
        const qty = parseInt(stockQuantity, 10);
        if (!qty || qty <= 0) {
          setMessage('Please enter a valid quantity (at least 1 share/unit).');
          return;
        }

        const currentPrice = parseFloat(selectedItem.currentPrice) || 100;
        const totalPayable = qty * currentPrice;

        const investmentData = {
          name: selectedItem.name,
          type: validObjectType,
          symbol: selectedItem.symbol || selectedItem.name.substring(0, 5).toUpperCase(),
          amount: totalPayable,
          quantity: qty,
          frequency: 'one-time',
          investedValue: totalPayable,
          marketValue: totalPayable,
          logo: selectedItem.logo,
          purchaseDate: new Date().toISOString()
        };

        await addInvestment(investmentData);
        setMessage(`Successfully purchased ${qty} ${qty === 1 ? 'share/unit' : 'shares/units'} of ${selectedItem.name} for ₹${totalPayable.toLocaleString('en-IN')}! 🎉`);
        handleCloseInvestModal();
      } else {
        if (!investmentAmount || isNaN(investmentAmount) || parseFloat(investmentAmount) <= 0) {
          setMessage('Please enter a valid investment amount.');
          return;
        }

        const amt = parseFloat(investmentAmount);
        const unitNav = parseFloat(selectedItem.currentPrice) || parseFloat(selectedItem.nav) || 50;
        const purchasedUnits = parseFloat((amt / unitNav).toFixed(4));

        const investmentData = {
          name: selectedItem.name,
          type: validObjectType || 'Mutual Fund',
          symbol: selectedItem.symbol || selectedItem.name.substring(0, 5).toUpperCase(),
          amount: unitNav,
          quantity: purchasedUnits,
          frequency: investmentFrequency,
          investedValue: amt,
          marketValue: amt,
          logo: selectedItem.logo,
          purchaseDate: new Date().toISOString()
        };

        await addInvestment(investmentData);
        setMessage(`Successfully invested ₹${amt.toLocaleString('en-IN')} in ${selectedItem.name} (${purchasedUnits} units at NAV ₹${unitNav.toFixed(2)})! 🎉`);
        handleCloseInvestModal();
      }
    } catch (err) {
      console.error("Failed to add to portfolio:", err);
      setMessage(`Failed to invest in ${selectedItem.name}: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 3500);
  };

  // Helper to render card details cleanly
  const renderCardDetails = (item, isGrid) => {
    const investedText = (item.investedValue && item.investedValue > 0) ? `₹${item.investedValue.toLocaleString('en-IN')}` : '₹0';

    if (isGrid) {
      if (item.type === 'Mutual Fund') {
        return (
          <div className={styles.cardDetailsGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Market Value</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>1Y CAGR</span><span className={styles.detailValue}>{item.oneYearReturn?.toFixed(2)}%</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>3Y CAGR</span><span className={styles.detailValue}>{item.threeYearReturn?.toFixed(2)}%</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>5Y CAGR</span><span className={styles.detailValue}>{item.fiveYearReturn?.toFixed(2)}%</span></div>
          </div>
        );
      } else if (item.type === 'Stock') {
        return (
          <div className={styles.cardDetailsGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Current Price</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Day Change</span><span className={`${styles.detailValue} ${parseFloat(item.dayChange) >= 0 ? styles.positiveChange : styles.negativeChange}`}>{item.dayChange >= 0 ? '+' : ''}{item.dayChange?.toFixed(2)}%</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>1Y Return</span><span className={styles.detailValue}>{item.oneYearReturn?.toFixed(2)}%</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>3Y Return</span><span className={styles.detailValue}>{item.threeYearReturn?.toFixed(2)}%</span></div>
          </div>
        );
      } else if (item.type === 'NFO') {
        return (
          <div className={styles.cardDetailsGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Issue Price</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Open Date</span><span className={styles.detailValue}>{item.openDate || 'N/A'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Close Date</span><span className={styles.detailValue}>{item.closeDate || 'N/A'}</span></div>
          </div>
        );
      } else if (item.type === 'ETF') {
        return (
          <div className={styles.cardDetailsGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Current Price</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Day Change</span><span className={`${styles.detailValue} ${parseFloat(item.dayChange) >= 0 ? styles.positiveChange : styles.negativeChange}`}>{item.dayChange >= 0 ? '+' : ''}{item.dayChange?.toFixed(2)}%</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>Expense Ratio</span><span className={styles.detailValue}>{item.expenseRatio || 'N/A'}</span></div>
          </div>
        );
      }
      return null;
    } else {
      if (item.type === 'Mutual Fund') {
        return (
          <div className={styles.listItemDetails}>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Market Value</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>1Y CAGR</span><span className={styles.detailValue}>{item.oneYearReturn?.toFixed(2)}%</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>3Y CAGR</span><span className={styles.detailValue}>{item.threeYearReturn?.toFixed(2)}%</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>5Y CAGR</span><span className={styles.detailValue}>{item.fiveYearReturn?.toFixed(2)}%</span></div>
          </div>
        );
      } else if (item.type === 'Stock') {
        return (
          <div className={styles.listItemDetails}>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Current Price</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Day Change</span><span className={`${styles.detailValue} ${parseFloat(item.dayChange) >= 0 ? styles.positiveChange : styles.negativeChange}`}>{item.dayChange >= 0 ? '+' : ''}{item.dayChange?.toFixed(2)}%</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>1Y Return</span><span className={styles.detailValue}>{item.oneYearReturn?.toFixed(2)}%</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>3Y Return</span><span className={styles.detailValue}>{item.threeYearReturn?.toFixed(2)}%</span></div>
          </div>
        );
      } else if (item.type === 'NFO') {
        return (
          <div className={styles.listItemDetails}>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Issue Price</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Open Date</span><span className={styles.detailValue}>{item.openDate || 'N/A'}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Close Date</span><span className={styles.detailValue}>{item.closeDate || 'N/A'}</span></div>
          </div>
        );
      } else if (item.type === 'ETF') {
        return (
          <div className={styles.listItemDetails}>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Current Price</span><span className={styles.detailValue}>₹{item.currentPrice?.toLocaleString('en-IN')}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Invested</span><span className={styles.detailValue}>{investedText}</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Day Change</span><span className={`${styles.detailValue} ${parseFloat(item.dayChange) >= 0 ? styles.positiveChange : styles.negativeChange}`}>{item.dayChange >= 0 ? '+' : ''}{item.dayChange?.toFixed(2)}%</span></div>
            <div className={styles.listItemDetailColumn}><span className={styles.detailLabel}>Expense Ratio</span><span className={styles.detailValue}>{item.expenseRatio || 'N/A'}</span></div>
          </div>
        );
      }
      return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.exploreHeader}>
          <h1 className={styles.exploreTitle}>Explore Investments</h1>
          <p className={styles.exploreSubtitle}>Discover stocks, mutual funds, and investment opportunities</p>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Sticky Filter & Category Header Section */}
        <div className={styles.stickyFilterSection}>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            {loading ? (
              <>
                <div className={styles.searchBox}>
                  <span className={styles.searchIcon}>🔍</span>
                  <div className={styles.skeletonInput}></div>
                </div>
                <div className={styles.skeletonSelect}></div>
                <div className={styles.skeletonSelect}></div>
                <div className={styles.skeletonSelect}></div>
                <div className={styles.skeletonButton}></div>
              </>
            ) : (
              <>
                <div className={styles.searchBox}>
                  <span className={styles.searchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search stocks, mutual funds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={styles.filterSelect}>
                  <option>All Types</option>
                  <option>Mutual Fund</option>
                  <option>Stock</option>
                  <option>ETF</option>
                  <option>NFO</option>
                </select>
                <select value={filterCAGR} onChange={(e) => setFilterCAGR(e.target.value)} className={styles.filterSelect}>
                  <option>CAGR %</option>
                  <option>5%+</option>
                  <option>10%+</option>
                  <option>15%+</option>
                </select>
                <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className={styles.filterSelect}>
                  <option>Risk Level</option>
                  <option>Low Risk</option>
                  <option>Medium Risk</option>
                  <option>High Risk</option>
                </select>
                <button className={styles.filterButton}>Filter</button>
              </>
            )}
          </div>

          {/* Category Tabs */}
          <div className={styles.categoryTabs}>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeletonTabButton}></div>
              ))
            ) : (
              <>
                <button
                  className={activeCategory === 'Mutual Fund' ? styles.activeTab : styles.tabButton}
                  onClick={() => setActiveCategory('Mutual Fund')}
                >
                  Mutual Funds
                </button>
                <button
                  className={activeCategory === 'Stock' ? styles.activeTab : styles.tabButton}
                  onClick={() => setActiveCategory('Stock')}
                >
                  Stocks
                </button>
                <button
                  className={activeCategory === 'NFO' ? styles.activeTab : styles.tabButton}
                  onClick={() => setActiveCategory('NFO')}
                >
                  NFOs
                </button>
                <button
                  className={activeCategory === 'ETF' ? styles.activeTab : styles.tabButton}
                  onClick={() => setActiveCategory('ETF')}
                >
                  ETFs
                </button>
              </>
            )}
          </div>
        </div>

        {message && <p className={`${styles.message} ${message.includes('successfully') ? styles.success : styles.error}`}>{message}</p>}

        {/* Results Header */}
        <div className={styles.resultsHeader}>
          {loading ? (
            <>
              <div className={styles.skeletonTextMedium}></div>
              <div className={styles.skeletonSelect}></div>
              <div className={styles.skeletonToggleViewButton}></div>
            </>
          ) : (
            <>
              <span className={styles.resultsCount}>{exploreResults.length} Results</span>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className={styles.sortSelect}>
                <option>Sort by Performance</option>
                <option>Sort by Name (A-Z)</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              {/* Grid/List Toggle Button */}
              <button onClick={() => setIsGridView(!isGridView)} className={styles.toggleViewButton}>
                {isGridView ? '☰' : '▦'}
              </button>
            </>
          )}
        </div>

        {/* Investment Cards Grid/List */}
        {loading ? (
          <div className={isGridView ? styles.investmentCardsGrid : styles.investmentCardsList}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={isGridView ? styles.skeletonInvestmentCardGrid : styles.skeletonInvestmentCardList}>
                {/* Skeleton for common header */}
                <div className={isGridView ? styles.skeletonCardHeader : styles.skeletonListItemHeader}>
                  <div className={styles.skeletonCircle}></div>
                  <div className={styles.skeletonTextGroup}>
                    <div className={styles.skeletonTextMedium}></div>
                    <div className={styles.skeletonTextSmall}></div>
                  </div>
                  <div className={styles.skeletonRiskTag}></div>
                </div>

                {/* Skeleton for details (dynamic based on view) */}
                {isGridView ? (
                  <div className={styles.skeletonCardDetailsGrid}>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.skeletonListItemDetails}>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                    <div className={styles.skeletonDetailItem}>
                      <div className={styles.skeletonTextSmall}></div>
                      <div className={styles.skeletonTextMedium}></div>
                    </div>
                  </div>
                )}

                {/* Skeleton for actions */}
                <div className={isGridView ? styles.skeletonCardActions : styles.skeletonListItemActions}>
                  <div className={styles.skeletonButtonSmall}></div>
                  <div className={styles.skeletonButtonSmall}></div>
                </div>
              </div>
            ))}
          </div>
        ) : exploreResults.length === 0 ? (
          <p className={styles.noResultsMessage}>No investments found matching your criteria.</p>
        ) : (
          <div className={isGridView ? styles.investmentCardsGrid : styles.investmentCardsList}>
            {exploreResults.map(item => (
              <div key={item._id} className={isGridView ? styles.investmentCard : styles.investmentListItem}>
                {/* Common header for both views */}
                <div className={isGridView ? styles.cardHeader : styles.listItemHeader}>
                  <img
                    src={item.logo || `https://placehold.co/40x40/FF7F27/white?text=${item.symbol ? item.symbol.substring(0, 4).toUpperCase() : 'N/A'}`}
                    alt={`${item.name} Logo`}
                    className={styles.cardLogo}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/FF7F27/white?text=${item.symbol ? item.symbol.substring(0, 4).toUpperCase() : 'N/A'}`; }}
                  />
                  <div className={styles.listItemNameAndSubtype}>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <p className={styles.cardSubtitle}>{item.subType}</p>
                  </div>
                  <span className={`${styles.riskTag} ${item.risk === 'Low Risk' ? styles.lowRisk : item.risk === 'Medium Risk' ? styles.mediumRisk : styles.highRisk}`}>
                    {item.risk}
                  </span>
                </div>

                {renderCardDetails(item, isGridView)}

                {/* Actions for both views */}
                <div className={isGridView ? styles.cardActions : styles.listItemActions}>
                  <button onClick={() => handleAddToWatchlist(item)} className={styles.addToWatchlistButton}>Add to Watchlist</button>
                  <button onClick={() => handleOpenInvestModal(item)} className={styles.addToButton}>Invest</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invest Modal JSX */}
      {showInvestModal && selectedItem && (() => {
        const isStockOrETF = selectedItem.type === 'Stock' || selectedItem.type === 'Stocks' || selectedItem.type === 'ETF' || selectedItem.type === 'ETFs';
        const pricePerUnit = parseFloat(selectedItem.currentPrice) || 0;
        const currentQty = parseInt(stockQuantity, 10) || 0;
        const totalPricePayable = currentQty * pricePerUnit;

        return (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>
                {isStockOrETF ? `Buy ${selectedItem.name}` : `Invest in ${selectedItem.name}`}
              </h2>
              <p className={styles.modalDescription}>
                {isStockOrETF
                  ? `Select quantity to calculate total order price at live market rate.`
                  : `Enter the amount you wish to invest and select frequency.`}
              </p>

              {isStockOrETF ? (
                <>
                  <div className={styles.modalInputGroup}>
                    <label className={styles.modalLabel}>Market Price per {selectedItem.type === 'ETF' || selectedItem.type === 'ETFs' ? 'Unit' : 'Share'}</label>
                    <div style={{ fontSize: '1.25rem', fontStyle: 'normal', fontWeight: '700', color: '#FF7F27', padding: '0.2rem 0' }}>
                      ₹{pricePerUnit.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className={styles.modalInputGroup}>
                    <label htmlFor="stockQuantity" className={styles.modalLabel}>
                      Quantity ({selectedItem.type === 'ETF' || selectedItem.type === 'ETFs' ? 'Number of Units' : 'Number of Shares'})
                    </label>
                    <input
                      type="number"
                      id="stockQuantity"
                      min="1"
                      className={styles.modalInput}
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="e.g., 3"
                    />
                  </div>

                  <div style={{ backgroundColor: '#fff7ed', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid #ffedd5', marginBottom: '1.2rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Total Amount Payable:</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
                      ₹{totalPricePayable.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {currentQty} x ₹{pricePerUnit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.modalInputGroup}>
                    <label htmlFor="investmentAmount" className={styles.modalLabel}>Investment Amount (₹)</label>
                    <input
                      type="number"
                      id="investmentAmount"
                      className={styles.modalInput}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div className={styles.modalInputGroup}>
                    <label htmlFor="investmentFrequency" className={styles.modalLabel}>Investment Frequency</label>
                    <select
                      id="investmentFrequency"
                      className={styles.modalSelect}
                      value={investmentFrequency}
                      onChange={(e) => setInvestmentFrequency(e.target.value)}
                    >
                      <option value="one-time">One-Time</option>
                      <option value="sip">SIP (Systematic Investment Plan)</option>
                    </select>
                  </div>
                </>
              )}

              {message && <p className={`${styles.message} ${message.includes('successfully') || message.includes('purchased') ? styles.success : styles.error}`}>{message}</p>}
              <div className={styles.modalActions}>
                <button onClick={handleCloseInvestModal} className={styles.modalCancelButton}>Cancel</button>
                <button onClick={handleInvest} className={styles.modalConfirmButton}>
                  {isStockOrETF ? `Confirm Buy (${currentQty} ${currentQty === 1 ? 'Unit' : 'Units'})` : `Confirm Invest`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Explore;
