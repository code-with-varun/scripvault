import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../services/profileService';

const Profile = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    getUserProfile().then(setForm);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserProfile(form);
    setMessage('Profile updated successfully ✅');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Profile</h2>
      <form onSubmit={handleSave} style={{ maxWidth: '400px' }}>
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} /><br />
        
        <label>Email:</label>
        <input name="email" value={form.email} disabled /><br />

        <label>Phone:</label>
        <input name="phone" value={form.phone} onChange={handleChange} /><br />

        <label>Address:</label>
        <textarea name="address" value={form.address} onChange={handleChange}></textarea><br />

        <button type="submit">Save</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default Profile;
