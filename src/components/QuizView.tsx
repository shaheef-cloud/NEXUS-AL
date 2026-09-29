import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlusCircle,
  Award,
  ArrowRight,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { User, QuizQuestion } from '../types';
import { api } from '../api';

interface QuizViewProps {
  user: User | null;
  initialTopic?: string;
  onQuizCompleted?: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  user,
  initialTopic,
  onQuizCompleted,
}) => {
  // Setup inputs
  const [topic, setTopic] = useState<string>(initialTopic || 'Data Structures & Algorithms');
  const [count, setCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questions: QuizQuestion[];
  } | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Update topic if passed from outside
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  // Core generate quiz function
  const handleGenerateQuiz = async (
    customTopic?: string,
    customCount?: number,
    customDiff?: 'easy' | 'medium' | 'hard'
  ) => {
    const finalTopic = (customTopic || topic).trim();
    const finalCount = customCount || count;
    const finalDiff = customDiff || difficulty;

    if (!finalTopic) {
      setSetupMessage('Please specify a topic or study subject for the quiz.');
      return;
    }

    try {
      setIsGenerating(true);
      setSetupMessage('Crafting customized conceptual quiz questions with AI...');
      const result = await api.generateQuiz({
        topic: finalTopic,
        count: finalCount,
        difficulty: finalDiff,
      });

      if (!result.questions || result.questions.length === 0) {
        throw new Error('No questions returned');
      }

      setActiveQuiz({
        topic: result.topic,
        difficulty: result.difficulty as any,
        questions: result.questions,
      });

      setCurrentIndex(0);
      setSelectedAnswers({});
      setHasAnsweredCurrent(false);
      setIsCompleted(false);
      setScore(0);
      setSetupMessage(null);
    } catch (err: any) {
      setSetupMessage('Failed to generate quiz. Please check your topic and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Select quiz answer
  const handleSelectAnswer = (optionIndex: number) => {
    if (hasAnsweredCurrent || !activeQuiz || isCompleted) return;

    const currentQuestion = activeQuiz.questions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
    setHasAnsweredCurrent(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  // Next question or complete
  const handleNextQuestion = async () => {
    if (!activeQuiz) return;

    if (currentIndex + 1 < activeQuiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setHasAnsweredCurrent(selectedAnswers[currentIndex + 1] !== undefined);
    } else {
      // Quiz finished
      setIsCompleted(true);
      // Save results
      try {
        await api.saveQuizResults({
          topic: activeQuiz.topic,
          difficulty: activeQuiz.difficulty,
          questionsCount: activeQuiz.questions.length,
          score: score,
          totalQuestions: activeQuiz.questions.length,
          questions: activeQuiz.questions,
        });
        if (onQuizCompleted) {
          onQuizCompleted();
        }
      } catch (err) {
        console.error('Failed to save quiz results:', err);
      }
    }
  };

  // Restart current quiz
  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setHasAnsweredCurrent(false);
    setIsCompleted(false);
    setScore(0);
  };

  // Start a new quiz setup
  const handleNewQuiz = () => {
    setActiveQuiz(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setHasAnsweredCurrent(false);
    setIsCompleted(false);
    setScore(0);
    setSetupMessage(null);
  };

  // Technical Compatibility: Expose required functions on window object
  useEffect(() => {
    (window as any).generateQuiz = (t?: string, c?: number, d?: any) => {
      handleGenerateQuiz(t, c, d);
    };
    (window as any).selectQuizAnswer = (index: number) => {
      handleSelectAnswer(index);
    };
    (window as any).nextQuizQuestion = () => {
      handleNextQuestion();
    };
    (window as any).restartQuiz = () => {
      handleRestartQuiz();
    };
    (window as any).newQuiz = () => {
      handleNewQuiz();
    };

    return () => {
      delete (window as any).generateQuiz;
      delete (window as any).selectQuizAnswer;
      delete (window as any).nextQuizQuestion;
      delete (window as any).restartQuiz;
      delete (window as any).newQuiz;
    };
  }, [activeQuiz, currentIndex, hasAnsweredCurrent, selectedAnswers, score, isCompleted, topic, count, difficulty]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5e4914] border border-amber-300/50 flex items-center justify-center text-amber-300 shadow-sm">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">AI Quiz Generator</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#40310c] border border-slate-300/30 text-amber-300">
                Active Recall
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Reinforce your knowledge with instant AI-generated multiple choice assessments
            </p>
          </div>
        </div>
      </div>

      {/* QUIZ SETUP PANEL with id="quiz-setup" */}
      {!activeQuiz && (
        <div id="quiz-setup" className="bg-[#523f11] border border-slate-300/30 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-100 font-serif pb-3 border-b border-slate-300/20">
            Configure Your Practice Quiz
          </h2>

          {setupMessage && (
            <div
              id="quiz-setup-message"
              className="mt-3 p-3 rounded-lg text-xs bg-[#40310c] border border-slate-300/30 text-slate-200 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{setupMessage}</span>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quiz Topic or Course Subject
              </label>
              <input
                id="quiz-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms, Computer Networks, Linear Algebra..."
                disabled={isGenerating}
                className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number of Questions
                </label>
                <select
                  id="quiz-count"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300/80"
                >
                  <option value={3}>3 Questions (Quick Sprint)</option>
                  <option value={4}>4 Questions (Standard)</option>
                  <option value={5}>5 Questions (Comprehensive)</option>
                  <option value={8}>8 Questions (Deep Assessment)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  id="quiz-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  disabled={isGenerating}
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300/80"
                >
                  <option value="easy">Easy (Definitions & Concepts)</option>
                  <option value="medium">Medium (Application & Trace)</option>
                  <option value="hard">Hard (Edge Cases & Advanced Problem Solving)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="generate-quiz-button"
                onClick={() => handleGenerateQuiz()}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-3 px-4 rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 font-semibold text-sm border border-slate-300/40 shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className={`w-4 h-4 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating Conceptual Quiz...' : 'Generate AI Quiz'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ RUNNER CONTAINER with id="quiz-container" */}
      {activeQuiz && (
        <div id="quiz-container" className="bg-[#523f11] border border-slate-300/30 rounded-xl p-6 shadow-sm">
          {!isCompleted ? (
            <div>
              {/* Quiz Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-300/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold px-2.5 py-1 rounded bg-[#40310c] text-amber-300 border border-slate-300/30">
                    {activeQuiz.topic}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#40310c] text-slate-300 border border-slate-300/20">
                    Difficulty: {activeQuiz.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                  <span>Question {currentIndex + 1} of {activeQuiz.questions.length}</span>
                  <span className="text-emerald-400 font-bold">Score: {score}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#3d2e0b] h-1.5 rounded-full my-4 overflow-hidden border border-slate-300/20">
                <div
                  className="bg-amber-300 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Statement */}
              <div className="my-6">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  Question #{currentIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                  {activeQuiz.questions[currentIndex].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeQuiz.questions[currentIndex].options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  const isCorrect = optIdx === activeQuiz.questions[currentIndex].correctAnswer;

                  let optionStyle = 'bg-[#43340d] border-slate-300/30 text-slate-200 hover:border-slate-300/60 hover:bg-[#523f11]';

                  if (hasAnsweredCurrent) {
                    if (isCorrect) {
                      // Green success element
                      optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      // Red error element
                      optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      optionStyle = 'bg-[#43340d]/50 border-slate-300/10 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(optIdx)}
                      disabled={hasAnsweredCurrent}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#382b0b] text-slate-200 border border-slate-300/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasAnsweredCurrent && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {hasAnsweredCurrent && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner when answered */}
              {hasAnsweredCurrent && (
                <div className={`mt-5 p-4 rounded-xl text-xs sm:text-sm border ${
                  selectedAnswers[currentIndex] === activeQuiz.questions[currentIndex].correctAnswer
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {selectedAnswers[currentIndex] === activeQuiz.questions[currentIndex].correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct Answer!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Not quite right.</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeQuiz.questions[currentIndex].explanation}
                  </p>
                </div>
              )}

              {/* Navigation Action */}
              <div className="mt-6 pt-4 border-t border-slate-300/20 flex items-center justify-between">
                <button
                  onClick={handleRestartQuiz}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-[#40310c] hover:bg-[#523f11] border border-slate-300/30 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>

                {hasAnsweredCurrent && (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/50 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{currentIndex + 1 < activeQuiz.questions.length ? 'Next Question' : 'Finish Quiz'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* FINAL SCORE SCREEN */
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#665017] border border-amber-300/50 flex items-center justify-center text-amber-300 shadow-md">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-amber-300 px-3 py-1 rounded bg-[#40310c] border border-slate-300/30">
                  Assessment Complete
                </span>
                <h3 className="text-2xl font-bold text-slate-100 mt-2 font-serif">
                  {Math.round((score / activeQuiz.questions.length) * 100) >= 70
                    ? 'Excellent Retention!'
                    : 'Good Effort — Active Recall in Progress!'}
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  You scored <strong className="text-slate-100">{score}</strong> out of <strong className="text-slate-100">{activeQuiz.questions.length}</strong> questions ({Math.round((score / activeQuiz.questions.length) * 100)}%).
                </p>
              </div>

              {/* Score card */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                  <span className="text-2xl font-bold text-emerald-400">{score}</span>
                  <span className="text-xs text-slate-300 block mt-1">Correct Answers</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center">
                  <span className="text-2xl font-bold text-rose-400">{activeQuiz.questions.length - score}</span>
                  <span className="text-xs text-slate-300 block mt-1">Review Needed</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRestartQuiz}
                  className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#574413] hover:bg-[#685217] text-slate-100 border border-slate-300/40 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>Retry Same Quiz</span>
                </button>
                <button
                  onClick={handleNewQuiz}
                  className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 border border-slate-300/40 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Start New Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
