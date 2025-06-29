import React, { useState, useEffect } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistService';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [form, setForm] = useState({
    name: '',
    type: 'Mutual Fund',
    marketValue: '',
    investedValue: ''
  });

  useEffect(() => {
    getWatchlist().then(setWatchlist);
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.marketValue || !form.investedValue) return alert("Please fill all fields");
    const added = await addToWatchlist(form);
    setWatchlist(prev => [...prev, added]);
    setForm({ name: '', type: 'Mutual Fund', marketValue: '', investedValue: '' });
  };

  const handleRemove = async (id) => {
    await removeFromWatchlist(id);
    setWatchlist(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Watchlist</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleInput} />
        <select name="type" value={form.type} onChange={handleInput}>
          <option>Mutual Fund</option>
          <option>Stock</option>
        </select>
        <input name="marketValue" type="number" placeholder="Market Value" value={form.marketValue} onChange={handleInput} />
        <input name="investedValue" type="number" placeholder="Invested Value" value={form.investedValue} onChange={handleInput} />
        <button type="submit">Add</button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Invested</th>
            <th>Market</th>
            <th>Gain/Loss</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>₹{item.investedValue}</td>
              <td>₹{item.marketValue}</td>
              <td style={{ color: item.marketValue - item.investedValue >= 0 ? 'green' : 'red' }}>
                ₹{(item.marketValue - item.investedValue).toLocaleString()}
              </td>
              <td>
                <button onClick={() => handleRemove(item.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Watchlist;
