import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // State for Interactive Investment Calculator
  const [monthlyInvest, setMonthlyInvest] = useState(10000);
  const [returnRate, setReturnRate] = useState(14);
  const [investmentYears, setInvestmentYears] = useState(10);

  // State for Asset Category Showcase Tab
  const [activeTab, setActiveTab] = useState('Stocks');

  // SIP Calculator Formula
  const months = investmentYears * 12;
  const monthlyRate = returnRate / 12 / 100;
  const totalInvested = monthlyInvest * months;
  const futureValue = Math.round(
    monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const estimatedGains = Math.max(0, futureValue - totalInvested);

  // Sample Featured Assets Data
  const sampleAssets = {
    Stocks: [
      { name: 'Reliance Industries Ltd', symbol: 'RELIANCE', price: 2950.40, change: '+1.85%', risk: 'Low Risk', return: '24.5% (3Y)' },
      { name: 'Tata Motors Ltd', symbol: 'TATAMOTORS', price: 985.20, change: '+3.12%', risk: 'Medium Risk', return: '68.2% (3Y)' },
      { name: 'Infosys Ltd', symbol: 'INFY', price: 1640.10, change: '+0.95%', risk: 'Low Risk', return: '18.4% (3Y)' },
      { name: 'HDFC Bank Ltd', symbol: 'HDFCBANK', price: 1530.80, change: '+1.10%', risk: 'Low Risk', return: '15.2% (3Y)' }
    ],
    'Mutual Funds': [
      { name: 'Quant Small Cap Fund', symbol: 'MUTUAL_FUND', price: 245.80, change: '+2.40%', risk: 'High Risk', return: '38.5% (3Y CAGR)' },
      { name: 'Parag Parikh Flexi Cap Fund', symbol: 'MUTUAL_FUND', price: 82.40, change: '+1.15%', risk: 'Medium Risk', return: '22.8% (3Y CAGR)' },
      { name: 'Mirae Asset Large Cap Fund', symbol: 'MUTUAL_FUND', price: 112.30, change: '+0.80%', risk: 'Low Risk', return: '16.5% (3Y CAGR)' },
      { name: 'SBI Equity Hybrid Fund', symbol: 'MUTUAL_FUND', price: 290.10, change: '+1.05%', risk: 'Low Risk', return: '17.2% (3Y CAGR)' }
    ],
    ETFs: [
      { name: 'Nippon India Nifty 50 BeES', symbol: 'NIFTYBEES', price: 268.50, change: '+0.92%', risk: 'Low Risk', return: '14.8% (1Y)' },
      { name: 'SBI ETF Gold', symbol: 'SETFGOLD', price: 62.40, change: '+0.45%', risk: 'Low Risk', return: '16.2% (1Y)' },
      { name: 'ICICI Prudential IT ETF', symbol: 'ITETF', price: 38.90, change: '+1.65%', risk: 'Medium Risk', return: '21.4% (1Y)' },
      { name: 'Bank BeES ETF', symbol: 'BANKBEES', price: 512.30, change: '+1.20%', risk: 'Medium Risk', return: '13.5% (1Y)' }
    ],
    NFOs: [
      { name: 'HDFC Manufacturing NFO', symbol: 'NFO', price: 10.00, change: 'New Launch', risk: 'High Risk', return: 'Issue Price ₹10' },
      { name: 'ICICI Prudential Energy NFO', symbol: 'NFO', price: 10.00, change: 'New Launch', risk: 'High Risk', return: 'Issue Price ₹10' },
      { name: 'Kotak Defense Fund NFO', symbol: 'NFO', price: 10.00, change: 'New Launch', risk: 'High Risk', return: 'Issue Price ₹10' },
      { name: 'Axis Multi-Cap NFO', symbol: 'NFO', price: 10.00, change: 'New Launch', risk: 'Medium Risk', return: 'Issue Price ₹10' }
    ],
    'Fixed Deposits': [
      { name: 'HDFC Bank Fixed Deposit', symbol: 'FD', price: 10000, change: 'Guaranteed', risk: 'Low Risk', return: '7.75% p.a.' },
      { name: 'Bajaj Finance FD', symbol: 'FD', price: 15000, change: 'Guaranteed', risk: 'Low Risk', return: '8.10% p.a.' },
      { name: 'ICICI Bank Fixed Deposit', symbol: 'FD', price: 10000, change: 'Guaranteed', risk: 'Low Risk', return: '7.60% p.a.' },
      { name: 'Mahindra Finance FD', symbol: 'FD', price: 10000, change: 'Guaranteed', risk: 'Low Risk', return: '8.05% p.a.' }
    ]
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background Glowing Ambient Orbs */}
      <div className={styles.bgGlowTop}></div>
      <div className={styles.bgGlowMiddle}></div>

      {/* Header / Navigation Bar */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.logoLink}>
            <img src="/logo.svg" alt="ScripVault Logo" className={styles.logoImg} />
          </Link>

          <ul className={styles.navMenu}>
            <li><a href="#features" className={styles.navLink}>Features</a></li>
            <li><a href="#explore-assets" className={styles.navLink}>Explore Assets</a></li>
            <li><a href="#calculator" className={styles.navLink}>SIP Calculator</a></li>
            <li><a href="#how-it-works" className={styles.navLink}>How It Works</a></li>
          </ul>

          <div className={styles.navActions}>
            {isAuthenticated ? (
              <Link to="/dashboard" className={styles.signupBtn}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>
                  Log In
                </Link>
                <Link to="/signup" className={styles.signupBtn}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}></span>
            <span>Intelligent Wealth & Portfolio Vault</span>
          </div>

          <h1 className={styles.heroTitle}>
            Track. Invest. Grow. <br />
            <span className={styles.gradientText}>Your Smart Financial Future.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Build your high-growth investment portfolio with confidence. Monitor Stocks, Mutual Funds, ETFs, NFOs & Fixed Deposits with real-time tracking and automated quantity-based investing.
          </p>

          <div className={styles.heroCtaGroup}>
            <Link to={isAuthenticated ? "/explore" : "/signup"} className={styles.heroPrimaryCta}>
              {isAuthenticated ? "Explore Market Assets 🚀" : "Start Investing Free →"}
            </Link>
            <a href="#calculator" className={styles.heroSecondaryCta}>
              Calculate SIP Gains 📊
            </a>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>₹500Cr+</span>
              <span className={styles.statLabel}>Assets Tracked</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>50+</span>
              <span className={styles.statLabel}>EQ Stocks & MFs</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>99.9%</span>
              <span className={styles.statLabel}>Security Uptime</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup Card */}
        <div className={styles.heroVisual}>
          {/* Floating Badges */}
          <div className={styles.floatingBadge1}>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Top Performing</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#4ADE80' }}>Quant Small Cap +38.5%</div>
            </div>
          </div>

          <div className={styles.floatingBadge2}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Vault Protection</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFF' }}>256-Bit Encrypted</div>
            </div>
          </div>

          {/* Interactive Live Dashboard Preview Card */}
          <div className={styles.dashboardPreviewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewUser}>
                <div className={styles.previewAvatar}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'SV'}
                </div>
                <div>
                  <div className={styles.previewGreeting}>Welcome Back</div>
                  <div className={styles.previewName}>{user?.name || 'Smart Investor'}</div>
                </div>
              </div>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot}></span> Live Market
              </div>
            </div>

            <div className={styles.portfolioValuation}>
              <div className={styles.portfolioLabel}>Total Portfolio Balance</div>
              <div className={styles.portfolioAmount}>₹4,85,240.50</div>
              <div className={styles.portfolioReturns}>
                <span>▲ +₹64,280.00 (+15.28% Overall)</span>
              </div>
            </div>

            <div className={styles.previewAssetList}>
              <div className={styles.previewAssetRow}>
                <div className={styles.assetInfo}>
                  <div className={styles.assetLogo}>🏎️</div>
                  <div>
                    <div className={styles.assetTitle}>Tata Motors EQ</div>
                    <div className={styles.assetCategory}>Equity Stock • 25 Shares</div>
                  </div>
                </div>
                <div className={styles.assetPrice}>
                  <div className={styles.priceValue}>₹24,630.00</div>
                  <div className={styles.priceChangePositive}>+3.12% Today</div>
                </div>
              </div>

              <div className={styles.previewAssetRow}>
                <div className={styles.assetInfo}>
                  <div className={styles.assetLogo}>📊</div>
                  <div>
                    <div className={styles.assetTitle}>Parag Parikh Flexi Cap</div>
                    <div className={styles.assetCategory}>Mutual Fund • Monthly SIP</div>
                  </div>
                </div>
                <div className={styles.assetPrice}>
                  <div className={styles.priceValue}>₹1,25,000.00</div>
                  <div className={styles.priceChangePositive}>+22.8% 3Y Return</div>
                </div>
              </div>

              <div className={styles.previewAssetRow}>
                <div className={styles.assetInfo}>
                  <div className={styles.assetLogo}>⚡</div>
                  <div>
                    <div className={styles.assetTitle}>Nippon India Nifty BeES</div>
                    <div className={styles.assetCategory}>ETF Tracker • 150 Units</div>
                  </div>
                </div>
                <div className={styles.assetPrice}>
                  <div className={styles.priceValue}>₹40,275.00</div>
                  <div className={styles.priceChangePositive}>+14.8% 1Y Return</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section id="features" className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Why Choose ScripVault</div>
          <h2 className={styles.sectionTitle}>Everything You Need to Multiply Your Wealth</h2>
          <p className={styles.sectionSubtitle}>
            Built for modern investors seeking precision, security, and intelligent financial management.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>📈</div>
            <h3 className={styles.featureTitle}>Real-Time Portfolio Sync</h3>
            <p className={styles.featureDesc}>
              Track live market valuations, profit/loss metrics, and daily percentage changes across all asset classes automatically.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>🎯</div>
            <h3 className={styles.featureTitle}>Quantity & SIP Investing</h3>
            <p className={styles.featureDesc}>
              Seamlessly place quantity-based orders for Stocks and ETFs, or automated SIP schedules for high-growth Mutual Funds.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>🛡️</div>
            <h3 className={styles.featureTitle}>Vault-Grade Security</h3>
            <p className={styles.featureDesc}>
              Your financial data and account integrity are protected by bank-level 256-bit SSL encryption and JWT authentication.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>💡</div>
            <h3 className={styles.featureTitle}>Ask Verified Experts</h3>
            <p className={styles.featureDesc}>
              Get direct guidance from verified financial advisors, portfolio managers, and market strategists inside ScripVault.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>📊</div>
            <h3 className={styles.featureTitle}>Smart Watchlists</h3>
            <p className={styles.featureDesc}>
              Create custom watchlists, filter by CAGR, risk rating, or asset type, and monitor live performance charts effortlessly.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>⚡</div>
            <h3 className={styles.featureTitle}>Instant Execution</h3>
            <p className={styles.featureDesc}>
              Add investments, manage your holdings, and update your profile without delays or complex paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* Asset Showcase Section */}
      <section id="explore-assets" className={styles.sectionWrapper} style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Market Assets</div>
          <h2 className={styles.sectionTitle}>Explore Diverse Investment Opportunities</h2>
          <p className={styles.sectionSubtitle}>
            Choose from curated Equity Stocks, Mutual Funds, ETFs, NFOs, and Fixed Deposits.
          </p>
        </div>

        <div className={styles.assetCategoryTabs}>
          {Object.keys(sampleAssets).map((category) => (
            <button
              key={category}
              className={`${styles.assetTabBtn} ${activeTab === category ? styles.activeAssetTab : ''}`}
              onClick={() => setActiveTab(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.assetGrid}>
          {sampleAssets[activeTab].map((item, idx) => (
            <div key={idx} className={styles.assetShowcaseCard}>
              <div className={styles.assetCardTop}>
                <div>
                  <span className={styles.assetSymbolBadge}>{item.symbol}</span>
                  <h4 className={styles.assetName}>{item.name}</h4>
                  <span className={styles.assetTypeTag}>{item.risk}</span>
                </div>
              </div>

              <div className={styles.assetMetrics}>
                <div className={styles.metricCol}>
                  <span className={styles.metricLabel}>Price / Value</span>
                  <span className={styles.metricVal}>
                    ₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : item.price}
                  </span>
                </div>
                <div className={styles.metricCol} style={{ textAlign: 'right' }}>
                  <span className={styles.metricLabel}>Returns</span>
                  <span className={styles.returnVal}>{item.return}</span>
                </div>
              </div>

              <Link to="/explore" className={styles.assetActionBtn}>
                Invest Now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SIP & Investment Return Calculator */}
      <section id="calculator" className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Wealth Calculator</div>
          <h2 className={styles.sectionTitle}>Visualize Your Compound Wealth Growth</h2>
          <p className={styles.sectionSubtitle}>
            Calculate how regular monthly SIP investments can build your long-term wealth vault.
          </p>
        </div>

        <div className={styles.calcCard}>
          <div className={styles.calcInputs}>
            <div className={styles.inputControl}>
              <div className={styles.labelRow}>
                <span className={styles.inputLabel}>Monthly Investment (SIP)</span>
                <span className={styles.inputValue}>₹{monthlyInvest.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={monthlyInvest}
                onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                className={styles.rangeSlider}
              />
            </div>

            <div className={styles.inputControl}>
              <div className={styles.labelRow}>
                <span className={styles.inputLabel}>Expected Annual Return Rate</span>
                <span className={styles.inputValue}>{returnRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className={styles.rangeSlider}
              />
            </div>

            <div className={styles.inputControl}>
              <div className={styles.labelRow}>
                <span className={styles.inputLabel}>Investment Horizon</span>
                <span className={styles.inputValue}>{investmentYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className={styles.rangeSlider}
              />
            </div>
          </div>

          <div className={styles.calcResults}>
            <div className={styles.resultBox}>
              <span className={styles.resultLabel}>Estimated Total Wealth</span>
              <span className={styles.resultValMain}>₹{futureValue.toLocaleString('en-IN')}</span>
            </div>

            <div className={styles.breakdownBar}>
              <div
                className={styles.investedFill}
                style={{ width: `${(totalInvested / futureValue) * 100}%` }}
              ></div>
              <div
                className={styles.gainsFill}
                style={{ width: `${(estimatedGains / futureValue) * 100}%` }}
              ></div>
            </div>

            <div className={styles.breakdownLegend}>
              <div className={styles.legendItem}>
                <span className={styles.dotBlue}></span>
                <span>Invested: <strong>₹{totalInvested.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.dotGreen}></span>
                <span>Est. Gains: <strong>₹{estimatedGains.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            <Link
              to={isAuthenticated ? "/explore" : "/signup"}
              className={styles.startSipBtn}
            >
              Start This SIP Strategy →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Getting Started</div>
          <h2 className={styles.sectionTitle}>Start Investing in 3 Simple Steps</h2>
          <p className={styles.sectionSubtitle}>
            Join ScripVault today and take control of your financial freedom.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Create Your Free Account</h3>
            <p className={styles.stepDesc}>
              Sign up in under 60 seconds with your email and set up your secure financial vault.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Explore & Build Watchlist</h3>
            <p className={styles.stepDesc}>
              Discover top stocks, mutual funds, and ETFs with real-time CAGR and risk analytics.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Invest & Track Portfolio</h3>
            <p className={styles.stepDesc}>
              Place orders with instant quantity/SIP calculation and track overall returns on your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Build Your Investment Vault?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of smart investors managing their wealth with ScripVault. Sign up today and experience intelligent investing.
          </p>

          <div className={styles.ctaBtnGroup}>
            {isAuthenticated ? (
              <Link to="/dashboard" className={styles.ctaPrimaryBtn}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/signup" className={styles.ctaPrimaryBtn}>
                  Get Started Free
                </Link>
                <Link to="/login" className={styles.ctaSecondaryBtn}>
                  Log In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div>
            <Link to="/" className={styles.footerLogoContainer}>
              <img src="/logo.svg" alt="ScripVault Logo" className={styles.footerLogoImg} />
            </Link>
            <p className={styles.footerBrandDesc}>
              ScripVault is an intelligent investment platform designed to help you track, invest, and grow your wealth seamlessly across Stocks, Mutual Funds, ETFs, NFOs, and Fixed Deposits.
            </p>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Quick Links</h4>
            <ul className={styles.footerList}>
              <li><Link to="/explore" className={styles.footerLink}>Explore Assets</Link></li>
              <li><Link to="/watchlist" className={styles.footerLink}>Watchlist</Link></li>
              <li><Link to="/ask" className={styles.footerLink}>Ask Experts</Link></li>
              <li><a href="#calculator" className={styles.footerLink}>SIP Calculator</a></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Asset Classes</h4>
            <ul className={styles.footerList}>
              <li><Link to="/explore" className={styles.footerLink}>Equity Stocks</Link></li>
              <li><Link to="/explore" className={styles.footerLink}>Mutual Funds</Link></li>
              <li><Link to="/explore" className={styles.footerLink}>Exchange Traded Funds (ETFs)</Link></li>
              <li><Link to="/explore" className={styles.footerLink}>New Fund Offers (NFOs)</Link></li>
              <li><Link to="/explore" className={styles.footerLink}>Fixed Deposits</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Account & Access</h4>
            <ul className={styles.footerList}>
              <li><Link to="/login" className={styles.footerLink}>Log In</Link></li>
              <li><Link to="/signup" className={styles.footerLink}>Sign Up Free</Link></li>
              <li><Link to="/dashboard" className={styles.footerLink}>Investor Dashboard</Link></li>
              <li><Link to="/profile" className={styles.footerLink}>User Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomCopyright}>
          <span>&copy; {new Date().getFullYear()} ScripVault Technologies. All rights reserved.</span>
          <span>Designed with ❤️ for Smart Wealth Building.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;