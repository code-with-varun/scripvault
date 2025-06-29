import React, { useState } from 'react';
import { submitQuery } from '../services/queryService';

const AskExperts = () => {
  const [form, setForm] = useState({
    category: 'Long-Term Investment',
    question: ''
  });
  const [message, setMessage] = useState('');

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question) return alert('Please enter your query.');
    await submitQuery(form);
    setMessage('Your query has been submitted! ✅');
    setForm({ category: 'Long-Term Investment', question: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Ask Investment Experts</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <label>Category:</label>
        <select name="category" value={form.category} onChange={handleInput}>
          <option>Long-Term Investment</option>
          <option>Short-Term Goals</option>
          <option>Tax Saving Options</option>
          <option>Retirement Planning</option>
        </select><br /><br />

        <label>Your Question:</label><br />
        <textarea
          name="question"
          rows="4"
          cols="50"
          value={form.question}
          onChange={handleInput}
          placeholder="e.g., What are the best mutual funds for long-term growth?"
        ></textarea><br /><br />

        <button type="submit">Submit Query</button>
      </form>

      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default AskExperts;
