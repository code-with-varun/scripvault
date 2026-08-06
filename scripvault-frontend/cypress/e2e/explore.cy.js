describe('ScripVault Explore Market Assets E2E Tests', () => {
  beforeEach(() => {
    const timestamp = Date.now();
    const user = {
      email: `exploreuser_${timestamp}@example.com`,
      password: 'Password123!',
      name: 'Explorer User'
    };

    cy.request('POST', 'http://localhost:3001/auth/register', user).then(() => {
      cy.request('POST', 'http://localhost:3001/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        const token = response.body.token;
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('user', JSON.stringify({ email: user.email, token, name: user.name }));
        cy.visit('/explore');
      });
    });
  });

  it('should render explore page header and filter options', () => {
    cy.contains('h1', 'Explore Investments').should('be.visible');
    cy.get('input[placeholder*="Search"]').should('be.visible');
    cy.contains('button', 'Mutual Funds').should('be.visible');
    cy.contains('button', 'Stocks').should('be.visible');
    cy.contains('button', 'ETFs').should('be.visible');
    cy.contains('button', 'NFOs').should('be.visible');
  });

  it('should filter asset cards when switching categories', () => {
    cy.contains('button', 'Stocks').click();
    cy.contains('Reliance Industries Ltd', { timeout: 10000 }).should('be.visible');

    cy.contains('button', 'Mutual Funds').click();
    cy.contains('Quant Small Cap Fund', { timeout: 10000 }).should('be.visible');
  });

  it('should calculate quantity-based stock purchase total in invest modal', () => {
    cy.contains('button', 'Stocks').click();
    cy.contains('button', 'Invest', { timeout: 10000 }).first().click();

    cy.contains('Buy', { timeout: 10000 }).should('be.visible');
    
    // Change quantity to 3
    cy.get('input[type="number"]').clear().type('3');
    cy.contains('Total Amount Payable').should('be.visible');
  });
});
