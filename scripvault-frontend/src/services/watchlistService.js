// frontend/src/services/watchlistService.js

const API_BASE_URL = (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:3001') + '/api';

/**
 * Helper function to parse response, handling both JSON and non-JSON errors.
 * Consumes the response body ONCE.
 */
const parseResponse = async (response) => {
  let data;
  try {
    data = await response.json(); // Attempt to parse as JSON first
  } catch (e) {
    // If JSON parsing fails, it might be plain text or empty body
    data = await response.text(); // Get as text
    if (!response.ok) {
        // If response is not OK and not JSON, throw a generic error with text content
        throw new Error(`Server error: ${response.status} ${response.statusText}. Response: ${data.substring(0, 200)}`);
    }
    // If response is OK but not JSON (e.g., 204 No Content), data will be empty string or simple text.
    return data; // Return text if it was successful non-JSON
  }

  if (!response.ok) {
    // If response is not OK, and we successfully parsed JSON, use its message
    const errorMessage = data.message || data.error || 'An unknown error occurred';
    throw new Error(`API error (${response.status}): ${errorMessage}`);
  }

  return data; // Return parsed JSON data
};


const getAuthToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) return token;
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

/**
 * Fetches the user's watchlist from the backend.
 * @returns {Promise<Array<Object>>} An array of watchlist items (populated Stock objects).
 */
export const getWatchlist = async () => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};

/**
 * Adds an item to the user's watchlist.
 * @param {Object} itemData - The data for the item to add (e.g., name, type, currentPrice, etc.).
 * @returns {Promise<Object>} The newly added watchlist item (Stock object) from the backend.
 */
export const addToWatchlist = async (itemData) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/watchlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

/**
 * Removes an item from the user's watchlist.
 * @param {string} id - The ID of the Stock to remove from the user's watchlist.
 * @returns {Promise<Object>} A success message.
 */
export const removeFromWatchlist = async (id) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/watchlist/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};
