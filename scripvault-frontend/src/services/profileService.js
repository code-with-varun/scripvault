// frontend/services/profileService.js
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

export const getUserProfile = async () => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for getUserProfile.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    const data = await response.json();
    // The backend's /api/profile returns the user object directly.
    // We need to map it to the frontend's expected structure including profileSummary.
    // The backend now provides most fields directly on the user object.
    // For profileSummary, we can construct it from the fetched user data.
    return {
      ...data,
      profileSummary: {
        name: data.fullName || 'User',
        memberSince: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A', // Use createdAt from timestamps
        // totalInvestments and activeGoals are not directly on User model,
        // they should be fetched from Portfolio/Goals or derived on frontend if needed.
        // For now, use dummy values or N/A.
        totalInvestments: data.investments ? `₹${data.investments.toLocaleString('en-IN')}` : '₹0', // Using 'investments' field from User model
        activeGoals: data.activeGoals || 'N/A', // Assuming activeGoals might be added later or derived
        profilePic: data.profilePic || 'https://placehold.co/80x80/cccccc/white?text=Profile',
      }
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
};

export const updateUserProfile = async (updatedProfileData) => {
  const token = getAuthToken();
  if (!token) {
    console.error("No authentication token found for updateUserProfile.");
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the JWT token
      },
      body: JSON.stringify(updatedProfileData), // Send the updated profile data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user profile');
    }

    const data = await response.json();
    // The backend's /api/profile returns the updated user object directly.
    // Similar to getUserProfile, map it to frontend's expected structure.
    return {
      ...data,
      profileSummary: {
        name: data.fullName || 'User',
        memberSince: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A',
        totalInvestments: data.investments ? `₹${data.investments.toLocaleString('en-IN')}` : '₹0',
        activeGoals: data.activeGoals || 'N/A',
        profilePic: data.profilePic || 'https://placehold.co/80x80/cccccc/white?text=Profile',
      }
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};
