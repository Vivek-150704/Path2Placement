// quiz-app-ui/src/QuizPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper, Grid, Radio, RadioGroup, FormControlLabel, LinearProgress, Container, CircularProgress } from '@mui/material';
import Timer from './Timer';
import StartScreen from './StartScreen';
import Registration from './Registration';
import QuestionPalette from './QuestionPalette';

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// We use a function inside useState to load from localStorage ONLY ONCE.
const loadInitialState = () => {
  const savedUserDetails = localStorage.getItem('userDetails');
  const savedQuestions = localStorage.getItem('questions');
  const savedAnswers = localStorage.getItem('answers');
  const savedQuizState = localStorage.getItem('quizState');

  if (savedUserDetails && savedQuizState && savedQuizState !== 'submitted') {
    return {
      userDetails: JSON.parse(savedUserDetails),
      questions: JSON.parse(savedQuestions || '[]'),
      answers: JSON.parse(savedAnswers || '{}'),
      quizState: savedQuizState,
    };
  }
  return { userDetails: null, questions: [], answers: {}, quizState: 'registering' };
};


export default function QuizPage() {
  const initialState = loadInitialState();
  const [userDetails, setUserDetails] = useState(initialState.userDetails);
  const [questions, setQuestions] = useState(initialState.questions);
  const [answers, setAnswers] = useState(initialState.answers);
  const [quizState, setQuizState] = useState(initialState.quizState);

  const [finalScore, setFinalScore] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const statusResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/status`);
        if (!statusResponse.data.isActive) {
          setQuizState('inactive');
        } else if (quizState === 'loading') {
          setQuizState('registering');
        }
      } catch (error) {
        console.error("Initialization failed:", error);
        setQuizState('inactive');
      }
    };
    checkStatus();
  }, [quizState]);

  const handleRegister = (data) => {
    setUserDetails(data);
    setQuizState('not-started');
    localStorage.setItem('userDetails', JSON.stringify(data));
    localStorage.setItem('quizState', 'not-started');
  };

  const handleStartQuiz = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/start`);
      const fetchedQuestions = response.data;
      
      const questionsWithShuffledOptions = fetchedQuestions.map(q => ({ ...q, options: shuffleArray(q.options) }));
      
      setQuestions(questionsWithShuffledOptions);
      setQuizState('active');
      setAnswers({});
      localStorage.setItem('questions', JSON.stringify(questionsWithShuffledOptions));
      localStorage.setItem('answers', JSON.stringify({}));
      localStorage.setItem('quizState', 'active');
    } catch (error) {
      console.error("Failed to start quiz:", error);
      alert("Could not load quiz questions. Please try again later.");
    }
  };

  const submitQuiz = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const userAnswers = Object.keys(answers).map(questionId => ({
      questionId: questionId,
      selectedAnswer: answers[questionId],
    }));

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/submit`, {
        userDetails,
        userAnswers,
      });
      setFinalScore({ score: response.data.score, total: response.data.total });
    } catch (error) {
      console.error("Error submitting quiz data:", error);
      setFinalScore({ score: 'N/A', total: questions.length });
    }

    setQuizState('submitted');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('quizState');
    localStorage.removeItem('answers');
    localStorage.removeItem('questions');
  }, [answers, questions.length, userDetails]);

  useEffect(() => {
    if (quizState !== 'active') return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        submitQuiz();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [quizState, submitQuiz]);

  const handleAnswerSelect = (questionId, selectedOption) => {
    if (quizState === 'active') {
      const newAnswers = { ...answers, [questionId]: selectedOption.target.value };
      setAnswers(newAnswers);
      localStorage.setItem('answers', JSON.stringify(newAnswers));
    }
  };

  const handleQuestionSelect = (questionId) => {
    const element = document.getElementById(questionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (quizState === 'loading') {
    return ( <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <CircularProgress /> </Box> );
  }

  if (quizState === 'inactive') {
    return ( <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#f5f5f5' }}> <Container maxWidth="sm"> <Paper elevation={4} sx={{ p: 4, borderRadius: '12px', textAlign: 'center' }}> <Typography variant="h4" fontWeight="700" gutterBottom>Quiz Closed</Typography> <Typography variant="h6" color="text.secondary"> The quiz is not currently active. Please check back later. </Typography> </Paper> </Container> </Box> );
  }

  if (quizState === 'registering') return <Registration onRegister={handleRegister} />;
  if (quizState === 'not-started' && userDetails) return <StartScreen userName={userDetails.name} onStartQuiz={handleStartQuiz} />;

  if (quizState === 'submitted') {
    return ( <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#f5f5f5' }}> <Container maxWidth="md"> <Paper elevation={4} sx={{ p: 6, borderRadius: '12px', textAlign: 'center' }}> <Typography variant="h4" fontWeight="700" gutterBottom>Submission Received!</Typography> <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}> Thank you for participating. </Typography> </Paper> </Container> </Box> );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (quizState === 'active' && questions.length > 0) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, px: 2, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              {/* --- TITLE CHANGED --- */}
              <Typography variant="h5" component="h1" fontWeight="700">Aptitude Test</Typography>
              {/* --- TIMER DURATION CHANGED --- */}
              <Timer duration={3600} onTimeUp={submitQuiz} />
            </Box>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Progress</Typography>
                <Typography variant="body2" color="text.secondary">{answeredCount} / {totalQuestions}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: '8px', borderRadius: '4px' }} />
            </Box>
            <Box sx={{ height: 'calc(100vh - 400px)', minHeight: '300px', overflowY: 'auto', pr: 2 }}>
              {questions.map((q, index) => (
                <Box key={q._id} id={q._id} sx={{ mb: 3 }}>
                  <Typography variant="h6" component="p" fontWeight="500" gutterBottom>{index + 1}. {q.questionText}</Typography>
                  <RadioGroup name={q._id} value={answers[q._id] || ''} onChange={(e) => handleAnswerSelect(q._id, e)}>
                    {q.options.map((option) => (
                      <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                    ))}
                  </RadioGroup>
                </Box>
              ))}
            </Box>
            <QuestionPalette questions={questions} answers={answers} onQuestionSelect={handleQuestionSelect} />
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button onClick={submitQuiz} variant="contained" size="large" sx={{ py: 1.5, px: 8, fontWeight: 'bold' }}>Submit Quiz</Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return ( <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <CircularProgress /> </Box> );
}