import React, { useState, useEffect } from 'react';
import { mockQuizzes } from '../../data/mockData';
import { useNotifications } from '../../context/NotificationContext';
import { useGamification } from '../../context/GamificationContext';
import {
  FileCheck2,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const quiz = mockQuizzes[0];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const { playChime, addNotification } = useNotifications();
  const { addXP, triggerConfetti } = useGamification();

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, timeLeft]);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    playChime('click');
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += quiz.totalMarks / quiz.questionsCount;
      }
    });
    return score;
  };

  const handleAutoSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    const pct = (score / quiz.totalMarks) * 100;
    if (pct >= 80) {
      triggerConfetti();
      playChime('levelUp');
      addXP(60, 'Scored 80%+ on Speed Quiz');
      addNotification({
        title: 'Mastery Quiz Certificate Unlocked! 🏆',
        message: `You scored ${score}/${quiz.totalMarks} and unlocked an official achievement badge!`,
        type: 'success'
      });
    } else {
      playChime('success');
      addXP(25, 'Completed Speed Quiz');
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setTimeLeft(quiz.durationMinutes * 60);
    playChime('click');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = quiz.questions[currentQuestionIndex];
  const score = isSubmitted ? calculateScore() : 0;
  const isPassed = (score / quiz.totalMarks) >= 0.8;

  return (
    <div className="space-y-6">
      {/* Quiz Header Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
            <FileCheck2 size={14} />
            <span>Live Interactive Speed Quiz</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Questions: {quiz.questionsCount} | Max Score: {quiz.totalMarks} Marks | Time: {quiz.durationMinutes} Minutes
          </p>
        </div>

        {/* Live Timer Countdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm">
            <Clock size={16} className="text-pink-400 animate-pulse" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleAutoSubmit}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-600/30"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleResetQuiz}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Retry Quiz</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Card if Submitted */}
      {isSubmitted && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/60 via-slate-900 to-indigo-950/60 border border-pink-500/40 text-center space-y-3 animate-in zoom-in-95">
          <div className="inline-flex p-3 rounded-full bg-pink-500/20 text-pink-300">
            <Award size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-white font-mono">
            Final Score: {score} / {quiz.totalMarks} ({((score / quiz.totalMarks) * 100).toFixed(0)}%)
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {isPassed
              ? 'Exemplary performance! You scored above 80% and unlocked the Quiz Grandmaster distinction.'
              : 'Good effort! Review the step-by-step explanations below to master the core concepts.'}
          </p>
        </div>
      )}

      {/* Main Question Box */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        {/* Question Header & Stepper */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-indigo-400">
            Question #{currentQuestionIndex + 1} of {quiz.questionsCount}
          </span>
          <div className="flex items-center gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                  currentQuestionIndex === i
                    ? 'bg-pink-600 text-white'
                    : selectedAnswers[i] !== undefined
                    ? 'bg-indigo-600/40 text-indigo-200'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
            const isCorrect = optIdx === currentQ.correctIndex;

            let borderBg = 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-200';
            if (isSubmitted) {
              if (isCorrect) {
                borderBg = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
              } else if (isSelected && !isCorrect) {
                borderBg = 'bg-rose-950/60 border-rose-500 text-rose-200';
              }
            } else if (isSelected) {
              borderBg = 'bg-pink-600/20 border-pink-500 text-white shadow-md shadow-pink-600/20';
            }

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                className={`p-4 rounded-2xl border text-left text-xs font-semibold transition flex items-center justify-between ${borderBg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {isSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Explanation (Shown when submitted) */}
        {isSubmitted && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Robo Sir Derivation &amp; Solution:</span>
            </div>
            <p className="leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Navigation bottom */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="px-4 py-2 bg-slate-800 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold"
          >
            Previous
          </button>
          <button
            disabled={currentQuestionIndex === quiz.questionsCount - 1}
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="px-4 py-2 bg-indigo-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <span>Next Question</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
