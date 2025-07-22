import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register({ setIsAuthenticated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Password criteria
  const criteria = [
    { label: 'At least 8 characters', test: pw => pw.length >= 8 },
    { label: 'At least one uppercase letter', test: pw => /[A-Z]/.test(pw) },
    { label: 'At least one lowercase letter', test: pw => /[a-z]/.test(pw) },
    { label: 'At least one number', test: pw => /[0-9]/.test(pw) },
    { label: 'At least one special character', test: pw => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
  ];

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const validatePassword = (pw) => criteria.every(c => c.test(pw));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Invalid email format.');
      return;
    }
    if (!validatePassword(password)) {
      toast.error('Password does not meet all criteria.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      await api.post('/users/register', { name, email, password, confirmPassword });
      toast.success('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-6 border rounded shadow bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="border p-2 w-full mb-2"
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="border p-2 w-full mb-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {/* Password criteria checklist */}
          <ul className="mb-2 text-sm">
            {criteria.map((c, i) => (
              <li key={i} className={c.test(password) ? 'text-green-600 flex items-center' : 'text-gray-500 flex items-center'}>
                <span className="inline-block w-4">{c.test(password) ? '✔️' : '⬜'}</span>
                <span className="ml-1">{c.label}</span>
              </li>
            ))}
          </ul>
          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button className="bg-blue-500 text-white px-4 py-2 w-full" type="submit">Register</button>
        </form>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <Link to="/login" className="text-blue-600 underline">Login</Link>
        </div>
        <ToastContainer position="top-center" autoClose={2000} />
      </div>
    </div>
  );
}

export default Register; 