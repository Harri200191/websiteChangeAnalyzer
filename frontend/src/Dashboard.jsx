import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [url, setUrl] = useState('');
  const [emails, setEmails] = useState(['']);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auto logout after 4 hours
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const timeout = exp - Date.now();
    if (timeout > 0) {
      const timer = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }, timeout);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const loadProjects = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProjects(res.data);
  };

  useEffect(() => { loadProjects(); }, []);

  const handleAddEmail = () => {
    if (emails.length < 3) setEmails([...emails, '']);
  };

  const handleRemoveEmail = (idx) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== idx));
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const filteredEmails = emails.map(e => e.trim()).filter(Boolean);
    if (!url || filteredEmails.length === 0) {
      setError('URL and at least one email are required.');
      return;
    }
    if (!/^https?:\/\/.+\..+/.test(url)) {
      setError('Please enter a valid URL.');
      return;
    }
    for (let email of filteredEmails) {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter valid email addresses.');
        return;
      }
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/projects', { url, emails: filteredEmails }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrl('');
      setEmails(['']);
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add project');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 mb-4">Add Project</button>
      {showForm && (
        <form onSubmit={handleProjectSubmit} className="p-4 border rounded mb-4 bg-gray-50">
          <input
            className="border p-2 w-full mb-2"
            placeholder="Website URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          {emails.map((email, i) => (
            <div key={i} className="flex mb-2">
              <input
                className="border p-2 w-full"
                placeholder={`Email ${i + 1}`}
                value={email}
                onChange={e => {
                  const updated = [...emails];
                  updated[i] = e.target.value;
                  setEmails(updated);
                }}
                required
              />
              {emails.length > 1 && (
                <button type="button" onClick={() => handleRemoveEmail(i)} className="ml-2 text-red-500">Remove</button>
              )}
            </div>
          ))}
          {emails.length < 3 && (
            <button type="button" onClick={handleAddEmail} className="text-blue-500 mb-2">+ Add Email</button>
          )}
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button className="bg-green-500 text-white px-4 py-2" type="submit">Save Project</button>
        </form>
      )}
      <h2 className="text-xl mt-6 mb-2 font-semibold">Projects</h2>
      <ul className="space-y-2">
        {projects.map(p => (
          <li key={p._id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <p><strong>URL:</strong> {p.url}</p>
              <p><strong>Emails:</strong> {p.emails.join(', ')}</p>
            </div>
            <button onClick={() => handleDelete(p._id)} className="bg-red-400 text-white px-2 py-1 rounded">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard; 