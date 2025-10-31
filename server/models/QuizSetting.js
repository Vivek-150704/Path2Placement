// server/models/QuizSetting.js
const mongoose = require('mongoose');

const quizSettingSchema = new mongoose.Schema({
  // There will only ever be one document with a known name
  settingName: { type: String, default: 'mainQuiz' }, 
  isActive: { type: Boolean, default: false } // Default to inactive
});

const QuizSetting = mongoose.model('QuizSetting', quizSettingSchema);

module.exports = QuizSetting;