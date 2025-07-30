import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.page}>
      {/* Header/Navbar placeholder - (Not in original Home.js, but implied by UI) 
          You would typically have a separate Header component here.
          For this exercise, I'll assume it's handled elsewhere or just
          add a very basic top bar for visual alignment.
      */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <img src="https://assets-global.website-files.com/63f734fb25b6c647a0c249c1/64016a4b162f4b01e74a8968_logo.svg" alt="ScripVault Logo" style={styles.logoImg} />
            ScripVault
          </div>
          <nav style={styles.nav}>
            <Link to="/explore" style={styles.navLink}>Explore</Link>
            <Link to="/features" style={styles.navLink}>Features</Link>
            <Link to="/pricing" style={styles.navLink}>Pricing</Link>
            <Link to="/contact" style={styles.navLink}>Contact</Link>
          </nav>
          <div style={styles.headerActions}>
            <Link to="/login" style={styles.loginBtn}>Login</Link>
            <Link to="/signup" style={styles.getStartedBtn}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heading}>Track. Invest. Grow.</h1>
          <p style={styles.subText}>
            Your intelligent investment companion. Make smarter financial decisions with personalized investing, expert insights, and real-time market tracking.
          </p>
          <div style={styles.btnGroup}>
            <Link to="/explore-funds" style={styles.heroPrimaryBtn}>Explore Funds</Link>
            <Link to="/login" style={styles.heroSecondaryBtn}>Login</Link>
          </div>
        </div>
        <div style={styles.heroRight}>
          <img
            src="investing-hero-img.webp" // Placeholder, replace with actual icon from UI
            alt="Investment Graphic"
            style={styles.heroImg}
          />
        </div>
      </section>

      {/* Why Choose ScripVault? Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>Why Choose ScripVault?</h2>
        <div style={styles.cardGroup}>
          <div style={styles.featureCard}>
            <img src="https://via.placeholder.com/60" alt="Goal-Based Icon" style={styles.featureIcon} /> {/* Placeholder icon */}
            <h3>Goal-Based Investing</h3>
            <p>Tailor your investments to your financial goals.</p>
          </div>
          <div style={styles.featureCard}>
            <img src="https://via.placeholder.com/60" alt="Insights Icon" style={styles.featureIcon} /> {/* Placeholder icon */}
            <h3>Expert Insights</h3>
            <p>Get expert recommendations and market analysis.</p>
          </div>
          <div style={styles.featureCard}>
            <img src="https://via.placeholder.com/60" alt="Real-Time Icon" style={styles.featureIcon} /> {/* Placeholder icon */}
            <h3>Real-Time Tracking</h3>
            <p>Monitor your portfolio performance with live updates.</p>
          </div>
        </div>
      </section>

      {/* Investment Options Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>Investment Options</h2>
        <div style={styles.cardGroup}>
          <div style={styles.investmentOptionCard}>
            <img src="https://via.placeholder.com/50" alt="FD Icon" style={styles.optionIcon} /> {/* Placeholder icon */}
            <h3>Fixed Deposits</h3>
            <p style={styles.returnRate}>7.5% p.a.</p>
            <Link to="/fixed-deposits" style={styles.optionBtn}>Invest Now</Link>
          </div>
          <div style={styles.investmentOptionCard}>
            <img src="https://via.placeholder.com/50" alt="ETFs Icon" style={styles.optionIcon} /> {/* Placeholder icon */}
            <h3>ETFs</h3>
            <p style={styles.returnRate}>12.8% Returns</p>
            <Link to="/etfs" style={styles.optionBtn}>Explore ETFs</Link>
          </div>
          <div style={styles.investmentOptionCard}>
            <img src="https://via.placeholder.com/50" alt="NPS Icon" style={styles.optionIcon} /> {/* Placeholder icon */}
            <h3>NPS</h3>
            <p style={styles.returnRate}>Tax Benefits</p>
            <Link to="/nps" style={styles.optionBtn}>Invest NPS</Link>
          </div>
          <div style={styles.investmentOptionCard}>
            <img src="https://via.placeholder.com/50" alt="NFO Icon" style={styles.optionIcon} /> {/* Placeholder icon */}
            <h3>NFO</h3>
            <p style={styles.returnRate}>New Launch</p>
            <Link to="/nfo" style={styles.optionBtn}>Discover NFOs</Link>
          </div>
        </div>
      </section>

      {/* Ready to Start Your Investment Journey? CTA */}
      <section style={styles.bottomCtaSection}>
        <h2 style={styles.bottomCtaHeading}>Ready to Start Your Investment Journey?</h2>
        <p style={styles.bottomCtaSubText}>Join thousands of investors who trust ScripVault for their financial growth.</p>
        <div style={styles.bottomCtaBtnGroup}>
          <Link to="/signup" style={styles.bottomCtaPrimaryBtn}>Get Started Free</Link>
          <button style={styles.bottomCtaSecondaryBtn}>Schedule Demo</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerCol}>
            <div style={styles.footerLogo}>
              <img src="https://assets-global.website-files.com/63f734fb25b6c647a0c249c1/64016a4b162f4b01e74a8968_logo.svg" alt="ScripVault Logo" style={styles.footerLogoImg} />
              ScripVault
            </div>
            <p style={styles.footerTagline}>Your trusted partner for intelligent investing. Track, Invest, and Grow your wealth with confidence.</p>
            <div style={styles.socialIcons}>
              {/* Placeholder for social icons */}
              <a href="#" style={styles.socialIconLink}>FB</a>
              <a href="#" style={styles.socialIconLink}>TW</a>
              <a href="#" style={styles.socialIconLink}>LI</a>
            </div>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Products</h4>
            <ul style={styles.footerList}>
              <li><Link to="/mutual-funds" style={styles.footerLink}>Mutual Funds</Link></li>
              <li><Link to="/stocks" style={styles.footerLink}>Stocks</Link></li>
              <li><Link to="/etfs" style={styles.footerLink}>ETFs</Link></li>
              <li><Link to="/nps" style={styles.footerLink}>NPS</Link></li>
              <li><Link to="/fixed-deposits" style={styles.footerLink}>Fixed Deposits</Link></li>
            </ul>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Support</h4>
            <ul style={styles.footerList}>
              <li><Link to="/help-center" style={styles.footerLink}>Help Center</Link></li>
              <li><Link to="/contact-us" style={styles.footerLink}>Contact Us</Link></li>
              <li><Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" style={styles.footerLink}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <p style={styles.copyright}>&copy; 2025 ScripVault. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  // General Page Styles
  page: {
    fontFamily: 'Poppins, sans-serif',
    color: '#333333', // Darker text for readability
    backgroundColor: '#ffffff',
  },

  // Header/Navbar Styles (added based on UI)
  header: {
    backgroundColor: '#ffffff',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#FF7F27', // Orange logo text
  },
  logoImg: {
    height: '30px', // Adjust size as needed
    marginRight: '10px',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    textDecoration: 'none',
    color: '#555',
    fontWeight: '500',
    '&:hover': {
      color: '#FF7F27', // Orange on hover
    },
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  loginBtn: {
    padding: '0.6rem 1.2rem',
    backgroundColor: 'transparent',
    color: '#FF7F27',
    border: '1px solid #FF7F27',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  getStartedBtn: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#FF7F27',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: '600',
  },

  // Hero Section Styles
  hero: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '4rem 2rem',
    backgroundColor: '#F8F9FB', // Light grey/off-white background
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroLeft: {
    flex: 1,
    minWidth: '300px',
    textAlign: 'left',
  },
  heroRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: '3rem', // Larger heading
    color: '#333333',
    marginBottom: '1rem',
    lineHeight: '1.2',
  },
  subText: {
    fontSize: '1.15rem',
    color: '#666666',
    lineHeight: '1.6',
    maxWidth: '500px',
  },
  btnGroup: {
    marginTop: '2rem',
    display: 'flex',
    gap: '1rem', // Space between buttons
  },
  heroPrimaryBtn: {
    padding: '1rem 2rem',
    backgroundColor: '#FF7F27', // Orange
    color: '#fff',
    border: 'none',
    borderRadius: '8px', // Slightly more rounded
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block', // For Link component
    textAlign: 'center',
  },
  heroSecondaryBtn: {
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    color: '#FF7F27', // Orange border
    border: '2px solid #FF7F27',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block', // For Link component
    textAlign: 'center',
  },
  heroImg: {
    width: '100%',
    maxWidth: '450px', // Adjusted size to fit the visual
    height: 'auto',
  },

  // General Section Styles
  section: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff', // White background for sections
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeading: {
    fontSize: '2.2rem',
    marginBottom: '3rem', // More space below heading
    fontWeight: '700',
    color: '#333333',
  },
  cardGroup: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  // Feature Cards (Why Choose ScripVault)
  featureCard: {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    width: '280px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)', // Stronger shadow
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  featureIcon: {
    width: '60px',
    height: '60px',
    marginBottom: '1rem',
  },
  'featureCard h3': {
    fontSize: '1.3rem',
    color: '#333333',
    marginBottom: '0.5rem',
  },
  'featureCard p': {
    fontSize: '0.95rem',
    color: '#666666',
    lineHeight: '1.5',
  },

  // Investment Option Cards (new section)
  investmentOptionCard: {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    width: '280px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    textAlign: 'left', // Align text left as per UI
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  optionIcon: {
    width: '50px',
    height: '50px',
    marginBottom: '1rem',
  },
  'investmentOptionCard h3': {
    fontSize: '1.4rem',
    color: '#333333',
    marginBottom: '0.5rem',
  },
  returnRate: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#FF7F27', // Orange for return rate
    marginBottom: '1rem',
  },
  optionBtn: {
    display: 'inline-block',
    padding: '0.8rem 1.5rem',
    backgroundColor: '#FF7F27',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 'auto', // Push button to bottom
  },

  // Bottom CTA Section (Ready to Start Your Investment Journey?)
  bottomCtaSection: {
    background: '#FF7F27', // Orange background
    color: '#fff',
    textAlign: 'center',
    padding: '5rem 2rem', // Increased padding
  },
  bottomCtaHeading: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  bottomCtaSubText: {
    fontSize: '1.2rem',
    marginBottom: '2.5rem',
  },
  bottomCtaBtnGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  bottomCtaPrimaryBtn: {
    padding: '1.2rem 2.5rem',
    fontSize: '1.15rem',
    background: '#ffffff',
    color: '#FF7F27', // Orange text
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  bottomCtaSecondaryBtn: {
    padding: '1.2rem 2.5rem',
    fontSize: '1.15rem',
    background: 'transparent',
    color: '#fff',
    border: '2px solid #fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  // Footer Styles
  footer: {
    background: '#1e293b', // Dark blue/grey background
    color: '#ffffff',
    padding: '3rem 2rem',
    fontSize: '0.9rem',
  },
  footerContent: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto 2rem auto',
    textAlign: 'left', // Align columns left
  },
  footerCol: {
    flexBasis: '200px', // Give columns a base width
    flexGrow: 1,
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '1rem',
  },
  footerLogoImg: {
    height: '35px',
    marginRight: '10px',
    filter: 'brightness(0) invert(1)', // Makes a color logo white if needed
  },
  footerTagline: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  socialIcons: {
    display: 'flex',
    gap: '1rem',
  },
  socialIconLink: {
    color: '#ffffff',
    fontSize: '1.2rem',
    textDecoration: 'none',
    border: '1px solid #fff',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: '#FF7F27', // Orange on hover
      borderColor: '#FF7F27',
    },
  },
  footerColHeading: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.2rem',
    color: '#FF7F27', // Orange headings in footer
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  'footerList li': {
    marginBottom: '0.7rem',
  },
  footerLink: {
    textDecoration: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    '&:hover': {
      color: '#FF7F27',
    },
  },
  copyright: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '0.85rem',
    color: '#cccccc',
  },
};

export default Home;