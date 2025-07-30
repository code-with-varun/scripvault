// frontend/services/queryService.js
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

export const getAllQueries = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getAllQueries.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ask-experts`, { // GET all queries for the user
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch previous queries');
    }

    const data = await response.json();
    // The backend's GET /api/ask-experts returns an array of query objects directly.
    return data; // Return the array of queries
  } catch (error) {
    console.error("Error in getAllQueries:", error);
    throw error; // Re-throw to be handled by the component
  }
};

export const submitQuery = async (query) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for submitQuery.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ask-experts/submit-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
      // Send the query object. Ensure it contains:
      // question (maps to backend 'text'), investmentType (maps to 'category'), goalType, tags, status, isAnswered, expert, expertAvatar, response
      body: JSON.stringify({
        question: query.question, // Frontend 'question' maps to backend 'text'
        investmentType: query.investmentType, // Frontend 'investmentType' maps to backend 'category'
        goalType: query.goalType,
        // The following fields are typically set by the backend on initial submission
        // but included here if frontend needs to provide defaults or specific values.
        // Backend will likely override 'status', 'isAnswered', 'expert', 'expertAvatar', 'response' for new queries.
        status: query.status || 'Pending',
        isAnswered: query.isAnswered || false,
        expert: query.expert || null,
        expertAvatar: query.expertAvatar || null,
        response: query.response || "Your query is being reviewed by our experts. You'll receive a detailed response within 24 hours. Thank you for your patience!",
        tags: query.tags || [], // Ensure tags is an array
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit query');
    }

    const data = await response.json();
    // The backend's POST /api/ask-experts/submit-query returns the newly created query object.
    return data; // Return the newly created query
  } catch (error) {
    console.error("Error in submitQuery:", error);
    throw error;
  }
};
