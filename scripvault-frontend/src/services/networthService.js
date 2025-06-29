import networth from '../data/networth.json';

export const getNetWorthTrend = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(networth), 300);
  });
};
