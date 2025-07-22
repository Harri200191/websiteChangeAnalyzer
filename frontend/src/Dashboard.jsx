import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, monitorApi } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- SVG Icons ---
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);
const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
// --- End Icons ---

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [url, setUrl] = useState('');
  const [emails, setEmails] = useState(['']);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Auto logout
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch {
      toast.error("Failed to load projects.");
    }
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
    const filteredEmails = emails.map(e => e.trim()).filter(Boolean);
    if (!url || filteredEmails.length === 0) {
      return toast.error('URL and at least one email are required.');
    }
    if (!/^https?:\/\/.+\..+/.test(url)) {
      return toast.error('Please enter a valid URL.');
    }
    for (let email of filteredEmails) {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return toast.error('Please enter valid email addresses.');
      }
    }
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/projects', { url, emails: filteredEmails }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const project = res.data;
      toast.success('Project added successfully!');
      
      try {
        await monitorApi.post(
          `/monitor/start`,
          { url, emails: filteredEmails, project_id: project._id }
        );
        toast.success('Monitoring started!');
      } catch {
        toast.warn('Project added, but failed to start monitoring.');
      }
      
      setUrl('');
      setEmails(['']);
      setShowForm(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add project');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProjects();
      toast.success('Project deleted!');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </header>

        <div className="mb-6">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md">
            <PlusIcon />
            <span>{showForm ? 'Cancel' : 'Add New Project'}</span>
          </button>
        </div>

        {showForm && (
          <div className="animate-fade-in-down">
            <form onSubmit={handleProjectSubmit} className="p-6 bg-white border rounded-lg shadow-md mb-8 space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input id="url" className="border p-2 w-full rounded-md" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Emails</label>
                {emails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input className="border p-2 w-full rounded-md" placeholder={`email@example.com`} value={email} onChange={e => {
                      const updated = [...emails]; updated[i] = e.target.value; setEmails(updated);
                    }} required />
                    {emails.length > 1 && (
                      <button type="button" onClick={() => handleRemoveEmail(i)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                    )}
                  </div>
                ))}
                {emails.length < 3 && (
                  <button type="button" onClick={handleAddEmail} className="text-blue-500 hover:text-blue-700 text-sm font-medium">+ Add another email</button>
                )}
              </div>
              <div className="flex justify-end">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors" type="submit">Save Project</button>
              </div>
            </form>
          </div>
        )}

        <h2 className="text-2xl mt-8 mb-4 font-semibold text-gray-700">Your Monitored Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p._id} className="bg-white p-5 rounded-lg shadow-md border flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-500">URL</span>
                  <p className="text-gray-800 truncate" title={p.url}>{p.url}</p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Emails</span>
                  <p className="text-gray-600 text-sm truncate" title={p.emails.join(', ')}>{p.emails.join(', ')}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
        {projects.length === 0 && (
          <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border">
            <h3 className="text-lg font-medium text-gray-800">No projects yet!</h3>
            <p className="text-gray-500 mt-1">Click "Add New Project" to start monitoring a website.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 