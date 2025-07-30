// frontend/services/exploreService.js
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

export const getExploreData = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getExploreData.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/explore`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch explore data');
    }

    const data = await response.json();
    // The backend's GET /api/explore returns an array of stock objects directly.
    return data; // Return the array of stocks/mutual funds
  } catch (error) {
    console.error("Error in getExploreData:", error);
    throw error; // Re-throw to be handled by the component
  }
};
