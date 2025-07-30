// frontend/services/dashboardService.js
// This service will now interact with your backend API
// and provide a structured response for the frontend Dashboard.

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

export const getDashboardData = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getDashboardData.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch dashboard data');
    }

    const backendData = await response.json();
    // The backend's /auth/dashboard currently returns { netWorth: ..., totalInvested: ... }
    // We need to augment this with placeholder data for other sections the frontend expects.

    // Structure the data to match what the frontend Dashboard component expects
    // Fill in other sections with placeholder/default data for now
    const dashboardData = {
      userName: backendData.userName || 'User', // Assume backend might send userName
      netWorth: backendData.netWorth || 0,
      totalInvested: backendData.totalInvested || 0,
      totalGains: backendData.totalGains || 0, // Assume backend might send totalGains
      overallReturnPercent: backendData.overallReturnPercent || 0, // Assume backend might send overallReturnPercent
      stocks: backendData.stocks || [], // Assume backend might send stocks
      mutualFunds: backendData.mutualFunds || [], // Assume backend might send mutualFunds
      marketSnapshot: { // Changed from marketTrends to marketSnapshot
        sensex: { value: 0, change: 0 }, // Numeric placeholders
        nifty: { value: 0, change: 0 },   // Numeric placeholders
        // You would need separate backend endpoints or data sources for real market data
      },
      holdingsSummary: backendData.holdingsSummary || [], // Assume backend might send holdingsSummary
      // Add other sections as per your Dashboard component's needs
    };

    // If backend provides marketSnapshot, use it. Otherwise, keep placeholders.
    if (backendData.marketSnapshot) {
        dashboardData.marketSnapshot = backendData.marketSnapshot;
    }

    return dashboardData;
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    throw error; // Re-throw to be handled by the component
  }
};
