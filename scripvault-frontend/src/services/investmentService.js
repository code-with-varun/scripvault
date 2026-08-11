// frontend/src/services/investmentService.js

const API_BASE_URL = (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:3001') + '/api';

// Helper function to get the JWT token from localStorage
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


/**
 * Adds a new investment to the user's portfolio.
 * @param {Object} investmentData - The data for the new investment (name, type, amount, etc.).
 * @returns {Promise<Object>} The newly created investment object from the backend.
 */
export const addInvestment = async (investmentData) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for addInvestment.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(investmentData),
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error adding investment:', error);
    throw error;
  }
};

/**
 * Fetches all investments for the current user.
 * @returns {Promise<Array<Object>>} An array of investment objects.
 */
export const getInvestments = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getInvestments.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

/**
 * Deletes an investment by its ID.
 * @param {string} id - The ID of the investment to delete.
 * @returns {Promise<Object>} A success message.
 */
export const deleteInvestment = async (id) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for deleteInvestment.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/investments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
};

/**
 * Sells a specified quantity of units from an investment holding.
 * @param {string} id - The ID of the investment holding to sell.
 * @param {Object} sellData - { unitsToSell: number, sellPrice: number }
 * @returns {Promise<Object>} The sell transaction summary result.
 */
export const sellInvestment = async (id, sellData) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for sellInvestment.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/investments/${id}/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sellData),
    });

    return await parseResponse(response);
  } catch (error) {
    console.error('Error selling investment:', error);
    throw error;
  }
};

