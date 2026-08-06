describe('ScripVault Home Landing Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the header with ScripVault logo and navigation links', () => {
    cy.get('img[alt="ScripVault Logo"]').should('be.visible');
    cy.contains('Features').should('be.visible');
    cy.contains('Explore Assets').should('be.visible');
    cy.contains('SIP Calculator').should('be.visible');
    cy.contains('How It Works').should('be.visible');
    cy.contains('Log In').should('be.visible');
    cy.contains('Get Started').should('be.visible');
  });

  it('should render Hero section content, statistics, and preview card', () => {
    cy.contains('h1', 'Track. Invest. Grow.').should('be.visible');
    cy.contains('Your Smart Financial Future.').should('be.visible');
    cy.contains('₹500Cr+').should('be.visible');
    cy.contains('50+').should('be.visible');
    cy.contains('Live Market').should('be.visible');
    cy.contains('Total Portfolio Balance').should('be.visible');
  });

  it('should test interactive SIP Calculator functionality', () => {
    cy.get('#calculator').scrollIntoView();
    cy.contains('h2', 'Visualize Your Compound Wealth Growth').should('be.visible');
    cy.contains('Estimated Total Wealth').should('be.visible');
    
    // Change slider value for Monthly Investment
    cy.get('input[type="range"]').first().invoke('val', 25000).trigger('input').trigger('change');
    cy.contains('₹25,000').should('be.visible');
  });

  it('should allow switching asset category tabs in showcase', () => {
    cy.get('#explore-assets').scrollIntoView();
    cy.contains('button', 'Mutual Funds').click();
    cy.contains('Quant Small Cap Fund', { timeout: 10000 }).should('be.visible');
    
    cy.contains('button', 'ETFs').click();
    cy.contains('Nippon India Nifty 50 BeES', { timeout: 10000 }).should('be.visible');

    cy.contains('button', 'Fixed Deposits').click();
    cy.contains('HDFC Bank Fixed Deposit', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to login page when clicking Log In', () => {
    cy.contains('a', 'Log In').first().click();
    cy.url().should('include', '/login');
  });

  it('should navigate to signup page when clicking Get Started', () => {
    cy.contains('a', 'Get Started').first().click();
    cy.url().should('include', '/signup');
  });
});
