import profileData from '../data/profile.json';

let userProfile = { ...profileData };

export const getUserProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(userProfile), 300);
  });
};

export const updateUserProfile = (updated) => {
  return new Promise((resolve) => {
    userProfile = { ...userProfile, ...updated };
    setTimeout(() => resolve(userProfile), 300);
  });
};
