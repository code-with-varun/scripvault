describe('ScripVault Authentication Flow E2E Tests', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `testuser_${timestamp}@example.com`,
    password: 'Password123!'
  };

  it('should display the signup page and allow registering a new user', () => {
    cy.visit('/signup');
    cy.contains('ScripVault').should('be.visible');
    cy.contains('Create Account').should('be.visible');

    cy.get('input[name="fullName"]').type(testUser.name);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('input[type="checkbox"]').check();

    cy.get('button[type="submit"]').click();

    // Should redirect to login page
    cy.url({ timeout: 10000 }).should('include', '/login');
  });

  it('should allow user login and redirect to investor dashboard', () => {
    cy.visit('/login');
    cy.contains('Welcome Back').should('be.visible');

    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);

    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard and store token
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.window().its('localStorage').invoke('getItem', 'token').should('exist');
  });
});
