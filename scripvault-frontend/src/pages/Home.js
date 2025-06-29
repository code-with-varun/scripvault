import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heading}>Invest Smarter. Live Better.</h1>
          <p style={styles.subText}>
            Build long-term wealth with expertly curated mutual fund portfolios.
          </p>
          <div style={styles.btnGroup}>
            <button style={styles.primaryBtn}>📱 App Store</button>
            <button style={styles.secondaryBtn}>▶️ Play Store</button>
          </div>
        </div>
        <div style={styles.heroRight}>
          <img
            src="https://assets-global.website-files.com/63f734fb25b6c647a0c249c1/64228f2341751e8d16be12cd_investing-hero-img.png"
            alt="App Mockup"
            style={styles.heroImg}
          />
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>Why Choose ScripVault?</h2>
        <div style={styles.cardGroup}>
          <div style={styles.card}>
            <h3>📊 Smart SIPs</h3>
            <p>AI-curated SIPs tailored to your life goals.</p>
          </div>
          <div style={styles.card}>
            <h3>🎯 Goal Tracking</h3>
            <p>Monitor your goals and adjust strategies anytime.</p>
          </div>
          <div style={styles.card}>
            <h3>📈 Auto Rebalancing</h3>
            <p>Your portfolio gets optimized automatically.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <h2 style={styles.sectionHeading}>Join 1 Lakh+ Smart Investors</h2>
        <div style={styles.statsGroup}>
          <div style={styles.statBox}>
            <h3>1 Lakh+</h3>
            <p>Active Users</p>
          </div>
          <div style={styles.statBox}>
            <h3>₹250 Cr+</h3>
            <p>Assets Managed</p>
          </div>
          <div style={styles.statBox}>
            <h3>50+</h3>
            <p>Curated Portfolios</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={styles.section}>
        <h2 style={styles.sectionHeading}>What Our Users Say</h2>
        <div style={styles.testimonials}>
          <blockquote style={styles.quote}>
            “ScripVault helped me plan retirement 5 years early.”
          </blockquote>
          <blockquote style={styles.quote}>
            “The app is simple, powerful, and reliable.”
          </blockquote>
          <blockquote style={styles.quote}>
            “Best platform for mutual fund beginners and experts alike.”
          </blockquote>
        </div>
      </section>

      {/* Call to Action */}
      <section style={styles.ctaSection}>
        <h2>Start your investment journey today</h2>
        <Link to="/signup">
          <button style={styles.ctaBtn}>Get Started →</button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 ScripVault. All rights reserved.</p>
        <div>
          <Link to="/login" style={styles.footerLink}>Login</Link> |
          <Link to="/signup" style={styles.footerLink}> Sign Up</Link>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'Poppins, sans-serif',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  hero: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '4rem 2rem',
    background: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
    minWidth: '300px',
  },
  heroRight: {
    flex: 1,
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    color: '#0f766e',
    marginBottom: '1rem',
  },
  subText: {
    fontSize: '1.1rem',
    color: '#334155',
  },
  btnGroup: {
    marginTop: '2rem',
  },
  primaryBtn: {
    padding: '0.8rem 1.6rem',
    marginRight: '1rem',
    backgroundColor: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '0.8rem 1.6rem',
    backgroundColor: '#fff',
    color: '#0d9488',
    border: '2px solid #0d9488',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  heroImg: {
    width: '100%',
    maxWidth: '400px',
  },
  section: {
    padding: '4rem 2rem',
    background: '#f9fafb',
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: '1.8rem',
    marginBottom: '2rem',
    fontWeight: '600',
  },
  cardGroup: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  card: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '10px',
    width: '280px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  statsSection: {
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  statsGroup: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '2rem',
  },
  statBox: {
    backgroundColor: '#ecfdf5',
    padding: '1.5rem',
    borderRadius: '10px',
    width: '200px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  testimonials: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  quote: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '10px',
    width: '250px',
    fontStyle: 'italic',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  ctaSection: {
    background: '#0d9488',
    color: '#fff',
    textAlign: 'center',
    padding: '3rem 2rem',
  },
  ctaBtn: {
    marginTop: '1rem',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    background: '#fff',
    color: '#0d9488',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  footer: {
    background: '#f1f5f9',
    padding: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  footerLink: {
    margin: '0 0.5rem',
    color: '#0d9488',
    textDecoration: 'none',
  },
};

export default Home;
