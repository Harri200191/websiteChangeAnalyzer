require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const projectRoutes = require('./routes/Project');
const userRoutes = require('./routes/User');
const dotenv = require('dotenv')

dotenv.config()
const frontend_version = process.env.FRONTEND_TAG

const app = express();

app.use(cors({ 
  origin: [
    'http://localhost:4173', 
    'http://localhost:5173', 
    'http://0.0.0.0:4173', 
    'http://0.0.0.0:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
    frontend_version
  ],
}));

app.use(express.json());

app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch((err) => console.error(err));
