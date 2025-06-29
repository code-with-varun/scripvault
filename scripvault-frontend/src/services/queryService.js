import queries from '../data/queries.json';

let queryList = [...queries];

export const getAllQueries = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(queryList), 300);
  });
};

export const submitQuery = (query) => {
  return new Promise((resolve) => {
    const newQuery = {
      id: Date.now(),
      ...query,
      date: new Date().toISOString()
    };
    queryList.push(newQuery);
    setTimeout(() => resolve(newQuery), 300);
  });
};
