const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  // From the registration form
  name: { type: String, required: true },
  usn: { type: String, required: true },
  branch: { type: String, required: true },
  school: { type: String, required: true },
  year: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // From the quiz results
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  
  // Automatically added
  submittedAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;