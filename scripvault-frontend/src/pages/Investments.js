import React, { useEffect, useState } from 'react';
import { getInvestments, addInvestment, deleteInvestment } from '../services/investmentService';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'Mutual Fund', frequency: 'SIP', amount: '' });

  useEffect(() => {
    getInvestments().then(setInvestments);
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return alert("Fill all fields");
    const newItem = await addInvestment(form);
    setInvestments(prev => [...prev, newItem]);
    setForm({ name: '', type: 'Mutual Fund', frequency: 'SIP', amount: '' });
  };

  const handleDelete = async (id) => {
    await deleteInvestment(id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Investments</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem' }}>
        <input name="name" placeholder="Investment Name" value={form.name} onChange={handleInput} />
        <select name="type" value={form.type} onChange={handleInput}>
          <option>Mutual Fund</option>
          <option>Stock</option>
        </select>
        <select name="frequency" value={form.frequency} onChange={handleInput}>
          <option>SIP</option>
          <option>One-Time</option>
        </select>
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleInput} />
        <button type="submit">Add</button>
      </form>

      <div style={{
  overflowX: 'auto',
  maxWidth: '100%',
  padding: '1rem',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
}}>
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Frequency</th>
        <th>Amount</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {investments.map((item) => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.type}</td>
          <td>{item.frequency}</td>
          <td>₹{item.amount}</td>
          <td>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default Investments;
