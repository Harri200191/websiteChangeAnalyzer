const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { spawnSync } = require('child_process');

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all projects for the authenticated user
router.get('/', auth, async (req, res) => {
  const projects = await Project.find({ user: req.userId });
  res.json(projects);
});

// Create new monitor project for the authenticated user
router.post('/', auth, async (req, res) => {
  const { url, emails } = req.body;
  if (!url || !emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'URL and at least one email are required.' });
  }
  const project = new Project({ url, emails, user: req.userId });
  await project.save();

  try { 
    await project.save();
  } catch (err) {
    await project.deleteOne();
    return res.status(500).json({ message: 'Failed to initialize monitoring: ' + err.message });
  }

  res.status(201).json(project);
});

// Delete a project by ID (only if owned by user)
router.delete('/:id', auth, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, user: req.userId });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

module.exports = router;
