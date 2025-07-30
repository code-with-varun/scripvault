// frontend/services/investmentService.js
// This service will now interact with your backend API
// instead of mock data.

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:3001'; // Ensure this matches your backend server's address

// Helper function to get the JWT token from localStorage
const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const getInvestments = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getInvestments.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio`, { // Fetch from portfolio to get all investments
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch investments');
    }

    const data = await response.json();
    // The backend's /api/portfolio returns { user: ..., investments: [...] }
    return data.investments || []; // Return the array of investments
  } catch (error) {
    console.error("Error in getInvestments:", error);
    throw error; // Re-throw to be handled by the component
  }
};

export const addInvestment = async (newInvestment) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for addInvestment.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/invest`, { // Use the /invest endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
      body: JSON.stringify(newInvestment), // Send the new investment data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add investment');
    }

    const data = await response.json();
    // The backend's /api/portfolio/invest returns the updated portfolio with populated investments.
    return data.investments; // Return the full updated investments array
  } catch (error) {
    console.error("Error in addInvestment:", error);
    throw error;
  }
};

export const deleteInvestment = async (id) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for deleteInvestment.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/investment/${id}`, { // Use the specific investment delete endpoint
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete investment');
    }

    // Backend's delete endpoint returns a success message.
    return true; // Indicate success
  } catch (error) {
    console.error("Error in deleteInvestment:", error);
    throw error;
  }
};
