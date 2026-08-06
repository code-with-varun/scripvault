describe('ScripVault Profile Page E2E Tests', () => {
  const timestamp = Date.now();
  const user = {
    email: `profileuser_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'Profile Tester'
  };

  beforeEach(() => {
    cy.request('POST', 'http://localhost:3001/auth/register', user).then(() => {
      cy.request('POST', 'http://localhost:3001/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        const token = response.body.token;
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('user', JSON.stringify({ email: user.email, token, name: user.name }));
        cy.visit('/profile');
      });
    });
  });

  it('should render the user profile with correct user name and email', () => {
    cy.contains('Profile Settings', { timeout: 10000 }).should('be.visible');
    cy.get('input[name="fullName"]', { timeout: 10000 }).should('have.value', user.name);
    cy.get('input[name="email"]').should('have.value', user.email);
    cy.contains('Total Investments', { timeout: 10000 }).should('be.visible');
  });
});
