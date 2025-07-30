import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Import your services, which now directly import mock data
import { getDashboardData } from '../services/dashboardService';
import { getNetWorthTrend } from '../services/networthService';

/**
 * Simple SVG Chart Placeholder component for Net Worth Trend.
 * This component draws a basic line chart using SVG.
 * In a real application, you would use a dedicated charting library (e.g., Recharts, Chart.js).
 */
const SimpleNetWorthChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div style={styles.skeletonChartContainer}>
        <div style={styles.skeletonChart}></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>No trend data available to display chart.</div>;
  }

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1;

  const width = 600;
  const height = 300;
  const padding = 40;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const monthLabels = data.map(d => d.month);

  // Helper for currency formatting within the chart
  const formatCurrencyForChart = (value) => {
    if (value === null || value === undefined) return '--';
    return `₹${parseFloat(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {/* X-axis line */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
      {/* Y-axis line */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />

      {/* X-axis labels */}
      {monthLabels.map((label, i) => (
        <text
          key={i}
          x={padding + (i / (data.length - 1)) * (width - 2 * padding)}
          y={height - padding + 20}
          textAnchor="middle"
          fontSize="12"
          fill="#777"
        >
          {label}
        </text>
      ))}

      {/* Y-axis labels (simplified) */}
      {[minVal, (minVal + maxVal) / 2, maxVal].map((val, i) => (
        <text
          key={i}
          x={padding - 10}
          y={height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding)}
          textAnchor="end"
          alignmentBaseline="middle"
          fontSize="12"
          fill="#777"
        >
          {formatCurrencyForChart(val)}
        </text>
      ))}

      {/* Data line */}
      <polyline
        fill="none"
        stroke="#FF7F27"
        strokeWidth="3"
        points={points}
      />
      {/* Optional: Add circles for data points */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={padding + (i / (data.length - 1)) * (width - 2 * padding)}
          cy={height - padding - ((d.value - minVal) / (maxVal - minVal)) * (height - 2 * padding)}
          r="4"
          fill="#FF7F27"
          stroke="#fff"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
};


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize data with a default structured object to prevent errors on first render
  const [data, setData] = useState({
    userName: '',
    netWorth: 0,
    totalInvested: 0,
    totalGains: 0,
    overallReturnPercent: 0,
    stocks: [],
    mutualFunds: [],
    marketSnapshot: {
      sensex: { value: 0, change: 0 },
      nifty: { value: 0, change: 0 },
    },
    holdingsSummary: [],
  });

  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch main dashboard data using the service
        const dashboardRes = await getDashboardData();
        setData(dashboardRes);

        // Fetch net worth trend data using the service
        const trendRes = await getNetWorthTrend();
        setTrend(trendRes);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please check your mock data setup.");
        // Reset data to initial empty states on error
        setData({
          userName: '',
          netWorth: 0,
          totalInvested: 0,
          totalGains: 0,
          overallReturnPercent: 0,
          stocks: [],
          mutualFunds: [],
          marketSnapshot: {
            sensex: { value: 0, change: 0 },
            nifty: { value: 0, change: 0 },
          },
          holdingsSummary: [],
        });
        setTrend([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  // Helper functions for formatting
  // Moved to top-level or outside component if reusable across components
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹ --';
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  const formatPercent = (value) => `${value.toFixed(2)}%`;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Welcome back, {data.userName || 'User'}!</h1> {/* Use data.userName */}
          <p style={styles.welcomeSubtitle}>Here's your investment overview for today</p>
        </div>

        {/* Small Investment Type Cards */}
        <div style={styles.smallCardsGrid}>
          {loading ? (
            // Skeleton for small cards
            [1, 2, 3, 4].map(i => (
              <div key={i} style={styles.smallCardSkeleton}>
                <div style={styles.skeletonCircleSmall}></div>
                <div style={styles.skeletonTextSmall}></div>
              </div>
            ))
          ) : (
            <>
              <Link to="/fixed-deposits" style={styles.smallCard}>
                <img src="https://placehold.co/40x40/FF7F27/white?text=FD" alt="Fixed Deposits" style={styles.smallCardIcon} />
                Fixed Deposits
              </Link>
              <Link to="/nfos" style={styles.smallCard}>
                <img src="https://placehold.co/40x40/FF7F27/white?text=NFO" alt="NFOs" style={styles.smallCardIcon} />
                NFOs
              </Link>
              <Link to="/etfs" style={styles.smallCard}>
                <img src="https://placehold.co/40x40/FF7F27/white?text=ETF" alt="ETFs" style={styles.smallCardIcon} />
                ETFs
              </Link>
              <Link to="/nps" style={styles.smallCard}>
                <img src="https://placehold.co/40x40/FF7F27/white?text=NPS" alt="NPS" style={styles.smallCardIcon} />
                NPS
              </Link>
            </>
          )}
        </div>

        {/* Market Snapshot */}
        <div style={styles.marketSnapshotCard}>
          <h3 style={styles.marketSnapshotTitle}>Market Snapshot</h3>
          {loading ? (
            <div style={styles.marketIndicesGrid}>
              <div style={styles.marketIndexItem}>
                <div style={styles.skeletonTextMedium}></div>
                <div style={styles.skeletonTextLarge}></div>
                <div style={styles.skeletonTextSmall}></div>
              </div>
              <div style={styles.marketIndexItem}>
                <div style={styles.skeletonTextMedium}></div>
                <div style={styles.skeletonTextLarge}></div>
                <div style={styles.skeletonTextSmall}></div>
              </div>
            </div>
          ) : (
            <div style={styles.marketIndicesGrid}>
              <div style={styles.marketIndexItem}>
                <span style={styles.marketIndexLabel}>SENSEX</span>
                <span style={styles.marketIndexValue}>{formatCurrency(data.marketSnapshot.sensex.value)}</span>
                <span style={{ ...styles.marketIndexChange, color: data.marketSnapshot.sensex.change >= 0 ? '#28a745' : '#dc3545' }}>
                  {data.marketSnapshot.sensex.change >= 0 ? '+' : ''}{formatPercent(data.marketSnapshot.sensex.change)}
                </span>
              </div>
              <div style={styles.marketIndexItem}>
                <span style={styles.marketIndexLabel}>NIFTY</span>
                <span style={styles.marketIndexValue}>{formatCurrency(data.marketSnapshot.nifty.value)}</span>
                <span style={{ ...styles.marketIndexChange, color: data.marketSnapshot.nifty.change >= 0 ? '#28a745' : '#dc3545' }}>
                  {data.marketSnapshot.nifty.change >= 0 ? '+' : ''}{formatPercent(data.marketSnapshot.nifty.change)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Your Portfolio Section */}
        <div style={styles.yourPortfolioSection}>
          <div style={styles.portfolioSectionHeader}>
            <h3 style={styles.portfolioSectionTitle}>Your Portfolio</h3>
            {loading ? (
              <div style={styles.portfolioHeaderSummary}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={styles.portfolioHeaderSummaryItem}>
                    <div style={styles.skeletonTextSmallWhite}></div>
                    <div style={styles.skeletonTextMediumWhite}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.portfolioHeaderSummary}>
                <div style={styles.portfolioHeaderSummaryItem}>
                  <span style={styles.portfolioHeaderSummaryLabel}>Total Net Worth</span>
                  <span style={styles.portfolioHeaderSummaryValue}>{formatCurrency(data.netWorth)}</span>
                </div>
                <div style={styles.portfolioHeaderSummaryItem}>
                  <span style={styles.portfolioHeaderSummaryLabel}>Total Invested</span>
                  <span style={styles.portfolioHeaderSummaryValue}>{formatCurrency(data.totalInvested)}</span>
                </div>
                <div style={styles.portfolioHeaderSummaryItem}>
                  <span style={styles.portfolioHeaderSummaryLabel}>Total Gains</span>
                  <span style={{ ...styles.portfolioHeaderSummaryValue, color: data.totalGains >= 0 ? '#fff' : '#ffdddd' }}>
                    {data.totalGains >= 0 ? '+' : ''}{formatCurrency(data.totalGains)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Investment Growth Chart & Quick Invest/Holdings Grid */}
          <div style={styles.investmentGrowthAndQuickInvestGrid}>
            {/* Portfolio Growth Chart */}
            <div style={styles.portfolioGrowthCard}>
              <div style={styles.portfolioGrowthHeader}>
                <h3 style={styles.portfolioGrowthTitle}>Investment Growth</h3>
                <div style={styles.chartTimeFilters}>
                  <button style={styles.chartFilterButton}>1M</button>
                  <button style={styles.chartFilterButton}>3M</button>
                  <button style={{ ...styles.chartFilterButton, ...styles.activeChartFilter }}>1Y</button>
                </div>
              </div>
              <div style={styles.chartContainer}>
                <SimpleNetWorthChart data={trend} isLoading={loading} />
              </div>
            </div>

            {/* Quick Invest & Holdings */}
            <div style={styles.quickInvestAndHoldingsGridInner}>
              {/* Quick Invest */}
              <div style={styles.quickInvestCard}>
                <h3 style={styles.quickInvestTitle}>Quick Invest</h3>
                {loading ? (
                  <>
                    <div style={styles.skeletonButton}></div>
                    <div style={styles.skeletonButton}></div>
                  </>
                ) : (
                  <>
                    <button style={styles.quickInvestButton}>Invest in Mutual Funds</button>
                    <button style={styles.quickInvestButton}>Invest in Stocks</button>
                  </>
                )}
              </div>
              {/* Holdings Summary */}
              <div style={styles.holdingsCard}>
                <h3 style={styles.holdingsTitle}>Holdings</h3>
                {loading ? (
                  <div style={styles.holdingsList}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={styles.holdingsItem}>
                        <div style={styles.skeletonTextSmall}></div>
                        <div style={styles.skeletonTextSmall}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.holdingsList}>
                    {(data.holdingsSummary || []).map(holding => (
                      <div key={holding.type} style={styles.holdingsItem}>
                        <span style={styles.holdingsItemType}>{holding.type}</span>
                        <span style={styles.holdingsItemValue}>{formatCurrency(holding.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> {/* End of yourPortfolioSection */}

        {/* Stocks and Mutual Funds Portfolios Grid */}
        <div style={styles.portfolioCardsGrid}>
          {/* Stocks Portfolio Card */}
          <div style={styles.portfolioCard}>
            <div style={styles.portfolioCardHeader}>
              <h3 style={styles.portfolioCardTitle}>Stocks Portfolio</h3>
              <span style={styles.portfolioCardIcon}>📈</span>
            </div>
            {loading ? (
              <>
                <div style={styles.skeletonTextLarge}></div>
                <div style={styles.skeletonTextSmall}></div>
                <div style={styles.portfolioItems}>
                  {[1, 2].map(i => (
                    <div key={i} style={styles.portfolioItem}>
                      <div style={styles.skeletonCircleSmall}></div>
                      <div style={styles.skeletonTextMedium}></div>
                      <div style={styles.skeletonTextSmall}></div>
                      <div style={styles.skeletonTextSmall}></div>
                    </div>
                  ))}
                </div>
                <div style={styles.skeletonButton}></div>
              </>
            ) : (
              <>
                <p style={styles.portfolioTotalValue}>{formatCurrency((data.stocks || []).reduce((sum, s) => sum + s.currentValue, 0))}</p>
                <p style={{
                  ...styles.portfolioReturn,
                  // Calculate overall gain/loss for stocks based on current value vs. assumed initial value (shares * 100)
                  color: (data.stocks || []).reduce((sum, s) => sum + (s.currentValue - (s.shares * 100)), 0) >= 0 ? '#28a745' : '#dc3545'
                }}>
                  {(data.stocks || []).reduce((sum, s) => sum + (s.currentValue - (s.shares * 100)), 0) >= 0 ? '+' : ''}
                  {formatPercent(((data.stocks || []).reduce((sum, s) => sum + (s.currentValue - (s.shares * 100)), 0) / (data.stocks || []).reduce((sum, s) => sum + (s.shares * 100), 0)) * 100 || 0)} Overall
                </p>
                <div style={styles.portfolioItems}>
                  {(data.stocks || []).map(stock => (
                    <div key={stock.id} style={styles.portfolioItem}>
                      <img src={stock.logo} alt={stock.name} style={styles.portfolioItemLogo} />
                      <div style={styles.portfolioItemDetails}>
                        <span style={styles.portfolioItemName}>{stock.name}</span>
                        <span style={styles.portfolioItemSubtext}>{stock.shares} shares</span>
                      </div>
                      <span style={styles.portfolioItemValue}>{formatCurrency(stock.currentValue)}</span>
                      <span style={{ ...styles.portfolioItemGain, color: stock.gainPercent >= 0 ? '#28a745' : '#dc3545' }}>
                        {stock.gainPercent >= 0 ? '+' : ''}{formatPercent(stock.gainPercent)}
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/investments" style={styles.viewAllButton}>View All Stocks</Link>
              </>
            )}
          </div>

          {/* Mutual Funds Portfolio Card */}
          <div style={styles.portfolioCard}>
            <div style={styles.portfolioCardHeader}>
              <h3 style={styles.portfolioCardTitle}>Mutual Funds</h3>
              <span style={styles.portfolioCardIcon}>📊</span>
            </div>
            {loading ? (
              <>
                <div style={styles.skeletonTextLarge}></div>
                <div style={styles.skeletonTextSmall}></div>
                <div style={styles.portfolioItems}>
                  {[1, 2].map(i => (
                    <div key={i} style={styles.portfolioItem}>
                      <div style={styles.skeletonCircleSmall}></div>
                      <div style={styles.skeletonTextMedium}></div>
                      <div style={styles.skeletonTextSmall}></div>
                      <div style={styles.skeletonTextSmall}></div>
                    </div>
                  ))}
                </div>
                <div style={styles.skeletonButton}></div>
              </>
            ) : (
              <>
                <p style={styles.portfolioTotalValue}>{formatCurrency((data.mutualFunds || []).reduce((sum, mf) => sum + mf.currentValue, 0))}</p>
                <p style={{
                  ...styles.portfolioReturn,
                  // Calculate overall gain/loss for mutual funds based on current value vs. assumed initial value (sip * 10)
                  color: (data.mutualFunds || []).reduce((sum, mf) => sum + (mf.currentValue - (mf.sip * 10)), 0) >= 0 ? '#28a745' : '#dc3545'
                }}>
                  {(data.mutualFunds || []).reduce((sum, mf) => sum + (mf.currentValue - (mf.sip * 10)), 0) >= 0 ? '+' : ''}
                  {formatPercent(((data.mutualFunds || []).reduce((sum, mf) => sum + (mf.currentValue - (mf.sip * 10)), 0) / ((data.mutualFunds || []).reduce((sum, mf) => sum + (mf.sip * 10), 0) || 1)) * 100)} Overall
                </p>
                <div style={styles.portfolioItems}>
                  {(data.mutualFunds || []).map(fund => (
                    <div key={fund.id} style={styles.portfolioItem}>
                      <img src={fund.logo} alt={fund.name} style={styles.portfolioItemLogo} />
                      <div style={styles.portfolioItemDetails}>
                        <span style={styles.portfolioItemName}>{fund.name}</span>
                        <span style={styles.portfolioItemSubtext}>Monthly SIP: {formatCurrency(fund.sip)}</span>
                      </div>
                      <span style={styles.portfolioItemValue}>{formatCurrency(fund.currentValue)}</span>
                      <span style={{ ...styles.portfolioItemGain, color: fund.gainPercent >= 0 ? '#28a745' : '#dc3545' }}>
                        {fund.gainPercent >= 0 ? '+' : ''}{formatPercent(fund.gainPercent)}
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/investments" style={styles.viewAllButton}>View All Funds</Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={styles.quickActionsGrid}>
          {loading ? (
            // Skeleton for quick action buttons
            [1, 2, 3, 4].map(i => (
              <div key={i} style={styles.skeletonActionButton}>
                <div style={styles.skeletonCircle}></div>
                <div style={styles.skeletonTextSmall}></div>
              </div>
            ))
          ) : (
            <>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>💰</span> Add Money
              </button>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>📋</span> Watchlist
              </button>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>🙋</span> Ask Expert
              </button>
              <button style={styles.actionButton}>
                <span style={styles.actionIcon}>📄</span> Reports
              </button>
            </>
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
  loadingMessage: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#777',
    padding: '5rem',
  },
  errorMessage: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '500',
  },

  // Welcome Section Styles
  welcomeSection: {
    textAlign: 'left',
    marginBottom: '2rem',
    marginLeft: '1rem',
  },
  welcomeTitle: {
    fontSize: '2.2rem',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2rem',
  },

  // Small Investment Type Cards Grid (from Dashboard.jpg)
  smallCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
    justifyContent: 'center',
  },
  smallCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#333',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
  },
  smallCardIcon: {
    width: '40px',
    height: '40px',
    marginBottom: '0.5rem',
  },

  // Market Snapshot Card Styles (from Dashboard.jpg)
  marketSnapshotCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  marketSnapshotTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1.5rem',
    fontWeight: '600',
  },
  marketIndicesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    justifyContent: 'center',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  marketIndexItem: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  marketIndexLabel: {
    fontSize: '0.9rem',
    color: '#777',
    marginBottom: '0.3rem',
  },
  marketIndexValue: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '0.3rem',
  },
  marketIndexChange: {
    fontSize: '1rem',
    fontWeight: '500',
  },

  // Your Portfolio Section (colorful gradient background)
  yourPortfolioSection: {
    background: 'linear-gradient(to right, #FF7F27, #FF9933)',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    padding: '2rem',
    marginBottom: '2rem',
    color: '#fff',
  },
  portfolioSectionHeader: {
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  portfolioSectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#fff',
  },
  portfolioHeaderSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  portfolioHeaderSummaryItem: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  portfolioHeaderSummaryLabel: {
    fontSize: '0.9rem',
    opacity: 0.8,
    marginBottom: '0.3rem',
  },
  portfolioHeaderSummaryValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },

  // Investment Growth Chart & Quick Invest/Holdings Grid (within colorful section)
  investmentGrowthAndQuickInvestGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr',
    }
  },
  portfolioGrowthCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
  },
  portfolioGrowthHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  portfolioGrowthTitle: { // Added style for portfolio growth title
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  chartTimeFilters: {
    display: 'flex',
    gap: '0.5rem',
  },
  chartFilterButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f4f8',
    color: '#555',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    '&:hover': {
      backgroundColor: '#e0e4e8',
    },
  },
  activeChartFilter: {
    backgroundColor: '#FF7F27',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  chartContainer: {
    width: '100%',
    height: '350px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quickInvestAndHoldingsGridInner: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  },
  quickInvestCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  quickInvestTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1.5rem',
  },
  quickInvestButton: {
    width: '80%',
    padding: '0.8rem 1.5rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#E06B20',
    },
  },
  holdingsCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  holdingsTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  holdingsList: {
    width: '100%',
  },
  holdingsItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 0',
    borderBottom: '1px solid #eee',
    '&:last-child': {
      borderBottom: 'none',
    }
  },
  holdingsItemType: {
    fontSize: '1rem',
    color: '#333',
    fontWeight: '500',
  },
  holdingsItemValue: {
    fontSize: '1rem',
    color: '#333',
    fontWeight: '600',
  },

  // Stocks and Mutual Funds Portfolio Cards Styles (these remain white)
  portfolioCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
    '@media (max-width: 992px)': {
      gridTemplateColumns: '1fr',
    },
  },
  portfolioCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  portfolioCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  portfolioCardTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  portfolioCardIcon: {
    fontSize: '1.5rem',
    color: '#FF7F27',
  },
  portfolioTotalValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#333',
    margin: '0.5rem 0 0.2rem 0',
  },
  portfolioReturn: {
    fontSize: '1rem',
    fontWeight: '500',
    margin: '0 0 1.5rem 0',
  },
  portfolioItems: {
    marginBottom: '1.5rem',
  },
  portfolioItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '1rem',
  },
  portfolioItemLogo: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  portfolioItemDetails: {
    flex: 1,
    textAlign: 'left',
  },
  portfolioItemName: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
    display: 'block',
  },
  portfolioItemSubtext: {
    fontSize: '0.85rem',
    color: '#777',
  },
  portfolioItemValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginLeft: 'auto',
  },
  portfolioItemGain: {
    fontSize: '0.9rem',
    fontWeight: '500',
    marginLeft: '1rem',
    minWidth: '60px',
    textAlign: 'right',
  },
  viewAllButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#fff',
    color: '#FF7F27',
    border: '1px solid #FF7F27',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: 'auto',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    '&:hover': {
      backgroundColor: '#FF7F27',
      color: '#fff',
    },
  },

  // Quick Action Buttons Grid (from Dashboard3.png, moved to bottom)
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  actionButton: {
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.8rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    },
  },
  actionIcon: {
    fontSize: '2rem',
    color: '#FF7F27',
  },

  // Skeleton Loader Styles
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
  skeletonCircleSmall: { // Smaller circle for small cards
    width: '30px',
    height: '30px',
    backgroundColor: '#e0e0e0',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginBottom: '0.5rem',
  },
  skeletonChartContainer: {
    width: '100%',
    height: '350px', // Match chart container height
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    animation: 'pulse 1.5s infinite ease-in-out',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  skeletonChart: {
    width: '90%',
    height: '80%',
    backgroundColor: '#d0d0d0',
    borderRadius: '8px',
  },
  skeletonButton: {
    width: '80%',
    height: '45px', // Match button height
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginBottom: '1rem',
  },
  smallCardSkeleton: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '80px', // Ensure skeleton has some height
  },
  skeletonActionButton: {
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    minHeight: '120px', // Match action button height
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  skeletonTextSmallWhite: { // For text on orange background
    width: '60%',
    height: '16px',
    backgroundColor: 'rgba(255,255,255,0.3)', // Semi-transparent white
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
    marginBottom: '5px',
  },
  skeletonTextMediumWhite: { // For text on orange background
    width: '80%',
    height: '20px',
    backgroundColor: 'rgba(255,255,255,0.4)', // Semi-transparent white
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
};

export default Dashboard;
