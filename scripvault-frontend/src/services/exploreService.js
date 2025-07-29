// exploreService.js
// This service directly imports mock explore data for frontend development
// when no backend is available.

import exploreData from '../data/explore.json'; // Assuming explore.json is in src/data

export const getExploreData = async () => {
  // Simulate an asynchronous operation (like a network call) without actually making one.
  // In a real MERN app, this would be a fetch to your Express.js backend.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(exploreData);
    }, 500); // Simulate a small delay
  });
};
