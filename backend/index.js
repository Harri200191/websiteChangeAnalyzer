require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const projectRoutes = require('./routes/Project');
const userRoutes = require('./routes/User');

const app = express();

app.use(cors({ 
  origin: 'http://localhost:5173',
}));

app.use(express.json());

app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch((err) => console.error(err));
