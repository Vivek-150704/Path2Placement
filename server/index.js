// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Result = require('./models/Result');
const Admin = require('./models/Admin');
const Question = require('./models/Question');
const QuizSetting = require('./models/QuizSetting');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- NEW ENDPOINT: Check if USN already exists ---
app.post('/api/check-usn', async (req, res) => {
  try {
    const { usn } = req.body;
    if (!usn) {
      return res.status(400).json({ message: 'USN is required.' });
    }
    const existingResult = await Result.findOne({ usn: usn.toUpperCase() });
    if (existingResult) {
      return res.status(200).json({ exists: true });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error while checking USN.' });
  }
});

// --- UPDATED SUBMIT ENDPOINT: With final USN validation ---
app.post('/api/submit', async (req, res) => {
  try {
    const { userDetails, userAnswers } = req.body;
    if (!userDetails || !userDetails.usn) {
      return res.status(400).json({ message: 'User details are missing.' });
    }

    // Final security check on the backend
    const existingResult = await Result.findOne({ usn: userDetails.usn.toUpperCase() });
    if (existingResult) {
      return res.status(409).json({ message: 'This USN has already been used to submit a quiz.' });
    }

    const questionIds = userAnswers.map(a => a.questionId);
    const correctQuestions = await Question.find({ _id: { $in: questionIds } });
    const answerMap = new Map();
    correctQuestions.forEach(q => { answerMap.set(q._id.toString(), q.correctAnswer); });
    let score = 0;
    userAnswers.forEach(ans => { if (answerMap.get(ans.questionId) === ans.selectedAnswer) { score++; } });
    const resultData = { ...userDetails, score: score, totalQuestions: correctQuestions.length, };
    const newResult = new Result(resultData);
    await newResult.save();
    res.status(201).json({ message: 'Quiz result saved successfully!', score: score, total: correctQuestions.length });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ message: 'Failed to save quiz result.' });
  }
});


// --- ALL OTHER ENDPOINTS REMAIN THE SAME ---
app.post('/api/admin/login', async (req, res) => { try { const { username, password } = req.body; const admin = await Admin.findOne({ username }); if (!admin || admin.password !== password) { return res.status(401).json({ message: 'Invalid credentials' }); } res.status(200).json({ message: 'Admin login successful' }); } catch (error) { res.status(500).json({ message: 'Server error' }); } });
app.get('/api/results', async (req, res) => { try { const results = await Result.find({}).sort({ submittedAt: -1 }); res.status(200).json(results); } catch (error) { res.status(500).json({ message: 'Server error' }); } });
app.get('/api/questions', async (req, res) => { try { const questions = await Question.find({}); res.status(200).json(questions); } catch (error) { res.status(500).json({ message: 'Server error' }); } });
app.post('/api/questions', async (req, res) => { try { const newQuestion = new Question(req.body); await newQuestion.save(); res.status(201).json(newQuestion); } catch (error) { res.status(500).json({ message: 'Failed to create question.' }); } });
app.put('/api/questions/:id', async (req, res) => { try { const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.status(200).json(updatedQuestion); } catch (error) { res.status(500).json({ message: 'Failed to update question.' }); } });
app.delete('/api/questions/:id', async (req, res) => { try { await Question.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Question deleted successfully.' }); } catch (error) { res.status(500).json({ message: 'Failed to delete question.' }); } });
app.get('/api/quiz/start', async (req, res) => { try { const questionCount = 20; const randomQuestions = await Question.aggregate([{ $sample: { size: questionCount } }]); const questionsForStudent = randomQuestions.map(q => { const { correctAnswer, explanation, ...question } = q; return question; }); res.status(200).json(questionsForStudent); } catch (error) { res.status(500).json({ message: 'Could not fetch questions for the quiz.' }); } });
app.get('/api/quiz/status', async (req, res) => { try { let setting = await QuizSetting.findOne({ settingName: 'mainQuiz' }); if (!setting) { setting = new QuizSetting(); await setting.save(); } res.status(200).json({ isActive: setting.isActive }); } catch (error) { res.status(500).json({ message: 'Server error fetching status.' }); } });
app.put('/api/quiz/status', async (req, res) => { try { const { isActive } = req.body; const updatedSetting = await QuizSetting.findOneAndUpdate( { settingName: 'mainQuiz' }, { isActive: isActive }, { new: true, upsert: true } ); res.status(200).json(updatedSetting); } catch (error) { res.status(500).json({ message: 'Failed to update quiz status.' }); } });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));