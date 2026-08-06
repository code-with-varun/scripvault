describe('ScripVault Watchlist E2E Tests', () => {
  beforeEach(() => {
    const timestamp = Date.now();
    const user = {
      email: `watchuser_${timestamp}@example.com`,
      password: 'Password123!',
      name: 'Watchlist User'
    };

    cy.request('POST', 'http://localhost:3001/auth/register', user).then(() => {
      cy.request('POST', 'http://localhost:3001/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        const token = response.body.token;
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('user', JSON.stringify({ email: user.email, token, name: user.name }));
        cy.visit('/watchlist');
      });
    });
  });

  it('should render the watchlist page header and search input', () => {
    cy.contains('My Watchlist', { timeout: 10000 }).should('be.visible');
    cy.get('input[placeholder*="Search and add"]', { timeout: 10000 }).should('be.visible');
  });

  it('should show error when trying to add arbitrary invalid text not in stock/fund catalog', () => {
    cy.get('input[placeholder*="Search and add"]', { timeout: 10000 }).type('randominvalidtext123');
    cy.get('button[type="submit"]').click();
    cy.contains('not available in our market catalog', { timeout: 10000 }).should('be.visible');
  });
});
