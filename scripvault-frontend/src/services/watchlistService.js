import watchlist from '../data/watchlist.json';

let watchlistItems = [...watchlist];

export const getWatchlist = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(watchlistItems), 300);
  });
};

export const addToWatchlist = (item) => {
  return new Promise((resolve) => {
    const newItem = { ...item, id: Date.now() };
    watchlistItems.push(newItem);
    setTimeout(() => resolve(newItem), 300);
  });
};

export const removeFromWatchlist = (id) => {
  return new Promise((resolve) => {
    watchlistItems = watchlistItems.filter(i => i.id !== id);
    setTimeout(() => resolve(true), 300);
  });
};
