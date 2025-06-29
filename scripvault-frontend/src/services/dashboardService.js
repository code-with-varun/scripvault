import dashboardData from '../data/dashboard.json';

// Simulate an API call with delay
export const getDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dashboardData);
    }, 500); // Simulate 500ms delay
  });
};
