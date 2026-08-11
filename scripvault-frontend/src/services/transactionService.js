// frontend/src/services/transactionService.js

const API_BASE_URL = (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:3001') + '/api';

const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || localStorage.getItem('token');
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Fetches all transaction audit log entries for the current user.
 * @returns {Promise<Array<Object>>} List of transaction log objects.
 */
export const getTransactions = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to fetch transaction logs.');
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getTransactions service:", error);
    throw error;
  }
};
