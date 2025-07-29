// networthService.js
// This service directly imports mock net worth trend data for frontend development
// when no backend is available.

import networthData from '../data/networth.json'; // Assuming networth.json is in src/data

export const getNetWorthTrend = async () => {
  // Simulate an asynchronous operation (like a network call) without actually making one.
  // In a real MERN app, this would be a fetch to your Express.js backend.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(networthData);
    }, 300); // Simulate a small delay
  });
};
