describe('ScripVault Investor Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Register and login session helper
    const timestamp = Date.now();
    const user = {
      email: `dashuser_${timestamp}@example.com`,
      password: 'Password123!',
      name: `Dashboard User`
    };

    cy.request('POST', 'http://localhost:3001/auth/register', user).then(() => {
      cy.request('POST', 'http://localhost:3001/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        const token = response.body.token;
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('user', JSON.stringify({ email: user.email, token, name: user.name }));
        cy.visit('/dashboard');
      });
    });
  });

  it('should render the investor dashboard with user greeting and portfolio cards', () => {
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
    cy.contains('Stocks Portfolio').should('be.visible');
    cy.contains('Mutual Funds').should('be.visible');
  });

  it('should verify top layout navigation menu items', () => {
    cy.contains('a', 'Dashboard').should('be.visible');
    cy.contains('a', 'Explore').should('be.visible');
    cy.contains('a', 'Watchlist').should('be.visible');
    cy.contains('a', 'Profile').should('be.visible');
    cy.contains('a', 'Ask Experts').should('be.visible');
  });
});
