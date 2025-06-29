import investments from '../data/investments.json';

let investmentList = [...investments];

export const getInvestments = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(investmentList), 300);
  });
};

export const addInvestment = (newInvestment) => {
  return new Promise((resolve) => {
    const newItem = { ...newInvestment, id: Date.now() };
    investmentList.push(newItem);
    setTimeout(() => resolve(newItem), 300);
  });
};

export const deleteInvestment = (id) => {
  return new Promise((resolve) => {
    investmentList = investmentList.filter(item => item.id !== id);
    setTimeout(() => resolve(true), 300);
  });
};
