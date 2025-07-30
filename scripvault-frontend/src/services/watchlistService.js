// frontend/services/watchlistService.js
// This service will now interact with your backend API
// instead of mock data.

// Define your backend API base URL
const API_BASE_URL = 'http://localhost:3001'; // Ensure this matches your backend server's address

// Helper function to get the JWT token from localStorage
// In a real React app, you'd typically use a custom hook or context for this,
// but for service files, we'll directly access localStorage for simplicity.
const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const getWatchlist = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getWatchlist.");
    // In a real app, you might redirect to login or throw an error
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch watchlist');
    }

    const data = await response.json();
    return data.stocks || []; // Backend returns { user: ..., stocks: [...] }
  } catch (error) {
    console.error("Error in getWatchlist:", error);
    throw error; // Re-throw to be handled by the component
  }
};

export const addToWatchlist = async (item) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for addToWatchlist.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/watchlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
      body: JSON.stringify(item), // Send the item data to the backend
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add to watchlist');
    }

    const data = await response.json();
    // The backend returns the updated watchlist with populated stocks.
    // We need to return the newly added item or the updated list as per frontend expectation.
    // Assuming frontend expects the updated list:
    return data.stocks; // Return the full updated stocks array from the watchlist
  } catch (error) {
    console.error("Error in addToWatchlist:", error);
    throw error;
  }
};

export const removeFromWatchlist = async (id) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for removeFromWatchlist.");
    throw new Error("Authentication required.");
  }

  try {
    // Backend's delete route for investments is /api/investment/:investmentId
    // For watchlist, you might need a specific delete endpoint or modify existing.
    // Assuming you will add a DELETE /api/watchlist/:stockId endpoint on backend.
    // For now, I will use a POST with ID in body, or you can adjust backend to DELETE /api/watchlist/:id
    // If backend has DELETE /api/watchlist/:id, change method to 'DELETE' and URL to `${API_BASE_URL}/api/watchlist/${id}`
    // For simplicity, let's assume a DELETE route on the backend for watchlist items.
    const response = await fetch(`${API_BASE_URL}/api/watchlist/remove/${id}`, { // Assuming a /remove/:id endpoint
      method: 'DELETE', // Assuming DELETE method for removal
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove from watchlist');
    }

    // Backend might return a success message or the updated list.
    // For simplicity, we'll just return true on success.
    return true;
  } catch (error) {
    console.error("Error in removeFromWatchlist:", error);
    throw error;
  }
};
