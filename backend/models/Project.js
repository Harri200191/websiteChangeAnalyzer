const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  url: { type: String, required: true },
  emails: [{ type: String }],
  lastHash: { type: String, default: null },
  lastChecked: { type: Date, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Project', projectSchema);
