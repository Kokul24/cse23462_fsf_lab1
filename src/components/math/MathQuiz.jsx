import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Confetti from 'react-confetti';
import { useSpeech } from '../../hooks/useSpeech';
import { useStars } from '../../context/StarContext';

const QUESTIONS = [
    {
        question: 'What is the square root of 4?',
        options: ['1', '2', '3', '4'],
        correct: '2',
        explanation: '2 × 2 = 4, so √4 = 2! 🍀',
    },
    {
        question: 'What number multiplied by itself makes 9?',
        options: ['2', '3', '4', '9'],
        correct: '3',
        explanation: '3 × 3 = 9, so √9 = 3! 🌟',
    },
    {
        question: 'Find the square root of 16.',
        options: ['2', '4', '6', '8'],
        correct: '4',
        explanation: '4 × 4 = 16. A 4x4 square has 16 blocks! ⬜',
    },
    {
        question: 'What is √25?',
        options: ['4', '5', '6', '10'],
        correct: '5',
        explanation: '5 × 5 = 25! High five! ✋',
    },
    {
        question: 'If you have 36 flowers in a square, how many are in one row?',
        options: ['4', '5', '6', '9'],
        correct: '6',
        explanation: 'Because 6 × 6 = 36! 🌸',
    },
    {
        question: 'What is the square root of 49?',
        options: ['6', '7', '8', '9'],
        correct: '7',
        explanation: '7 × 7 = 49! Seven rows, seven columns. 🌻',
    },
    {
        question: 'Which number is the square root of 64?',
        options: ['6', '7', '8', '32'],
        correct: '8',
        explanation: '8 × 8 = 64. Great job! 🎱',
    },
    {
        question: 'What is √81?',
        options: ['8', '9', '10', '18'],
        correct: '9',
        explanation: '9 × 9 = 81. Almost at 100! 🚀',
    },
    {
        question: 'What is √100?',
        options: ['10', '20', '50', '100'],
        correct: '10',
        explanation: '10 × 10 = 100! A perfect score! 💯',
    },
    {
        question: 'What is √1 (square root of one)?',
        options: ['0', '1', '2', '10'],
        correct: '1',
        explanation: '1 × 1 is still 1! The root of 1 is 1. ☝️',
    },
];

const OPTION_COLORS = [
    'from-pink-100 to-rose-100 border-pink-300 hover:border-pink-400',
    'from-blue-100 to-sky-100 border-blue-300 hover:border-blue-400',
    'from-green-100 to-emerald-100 border-green-300 hover:border-green-400',
    'from-purple-100 to-violet-100 border-purple-300 hover:border-purple-400',
];

const PIE_COLORS = ['#22c55e', '#ef4444'];

const MathQuiz = () => {
    const { speak } = useSpeech();
    const { addStar } = useStars();
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [badges, setBadges] = useState([]);
    const [answers, setAnswers] = useState([]);   // Track each answer for the report
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Read question aloud
    useEffect(() => {
        if (!showResult) {
            const timer = setTimeout(() => {
                speak(QUESTIONS[currentQ].question);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [currentQ, showResult, speak]);

    const handleSelect = (option) => {
        setSelected(option);
    };

    const handleNext = () => {
        const q = QUESTIONS[currentQ];
        const correct = selected === q.correct;

        // Record the answer ONLY when moving close
        setAnswers((prev) => [...prev, {
            question: q.question,
            selected: selected,
            correct: q.correct,
            isCorrect: correct,
            explanation: q.explanation,
        }]);

        if (correct) {
            setScore((s) => s + 1);
        }

        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ((c) => c + 1);
            setSelected(null);
        } else {
            setShowResult(true);
            saveProgress();
        }
    };

    const saveProgress = async () => {
        // Calculate new score with the latest answer included
        const finalScore = score + (selected === QUESTIONS[currentQ].correct ? 1 : 0);

        try {
            const res = await fetch('http://localhost:4000/api/math/save-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'default', score: finalScore, totalQuestions: QUESTIONS.length }),
            });
            const data = await res.json();
            setBadges(data.badges || []);
            if (data.percentage === 100) {
                setShowConfetti(true);
                speak('Incredible! You got a perfect score and earned the Master Gardener Badge!');
            } else {
                speak(`Great job! You scored ${Math.round((finalScore / QUESTIONS.length) * 100)} percent!`);
            }
        } catch {
            speak(`You answered ${finalScore} out of ${QUESTIONS.length} correctly! Well done!`);
        }
    };

    const handleRestart = () => {
        setCurrentQ(0);
        setSelected(null);
        setScore(0);
        setShowResult(false);
        setBadges([]);
        setAnswers([]);
    };

    // ─── RESULTS / REPORT SCREEN ───
    if (showResult) {
        // Recalculate score from answers just to be sure
        const finalScore = answers.filter(a => a.isCorrect).length;
        const wrong = QUESTIONS.length - finalScore;
        const percentage = Math.round((finalScore / QUESTIONS.length) * 100);

        const pieData = [
            { name: 'Correct', value: finalScore },
            { name: 'Wrong', value: wrong },
        ];

        const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            if (value === 0) return null;
            return (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
                    {name}: {value}
                </text>
            );
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pb-24">
                {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={400} />}

                {/* Header */}
                <div className="text-center pt-8 pb-4">
                    <motion.h1
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500"
                    >
                        📋 Quiz Report
                    </motion.h1>
                </div>

                {/* Score & Pie Chart Card */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200 mx-4 mb-6"
                >
                    {/* Top: Emoji + Score */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="text-7xl mb-3"
                        >
                            {percentage === 100 ? '🏆' : percentage >= 70 ? '🌟' : percentage >= 40 ? '💪' : '📖'}
                        </motion.div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-1">
                            {percentage === 100 ? 'Perfect Score!' : percentage >= 70 ? 'Great Job!' : percentage >= 40 ? 'Good Effort!' : 'Keep Learning!'}
                        </h2>
                        <p className="text-gray-500">You scored <span className="font-bold text-purple-600">{percentage}%</span></p>
                    </div>

                    {/* Pie Chart */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
                        <div className="w-64 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={40}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        animationBegin={200}
                                        animationDuration={800}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend & Stats */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500"></div>
                                <span className="text-gray-700 font-semibold">Correct: {finalScore}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-500"></div>
                                <span className="text-gray-700 font-semibold">Wrong: {wrong}</span>
                            </div>
                            <div className="border-t pt-3 mt-2">
                                <p className="text-gray-500 text-sm">Total Questions: <span className="font-bold">{QUESTIONS.length}</span></p>
                                <p className="text-gray-500 text-sm">Score: <span className="font-bold text-purple-600">{percentage}%</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    {badges.length > 0 && (
                        <div className="mb-4 text-center">
                            <p className="text-sm font-semibold text-gray-500 mb-2">🎖️ YOUR BADGES</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {badges.map((badge) => (
                                    <motion.span
                                        key={badge}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-full text-sm font-bold border border-yellow-300"
                                    >
                                        🏅 {badge}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-green-600 font-semibold text-center">⭐ You earned {finalScore} stars!</p>
                </motion.div>

                {/* Per-Question Breakdown */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-purple-200 mx-4 mb-6"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">📝 Question-by-Question Review</h3>
                    <div className="space-y-3">
                        {answers.map((ans, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 * i }}
                                className={`p-4 rounded-2xl border ${ans.isCorrect
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-0.5">{ans.isCorrect ? '✅' : '❌'}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 text-sm">Q{i + 1}: {ans.question}</p>
                                        <div className="flex gap-4 mt-1 text-sm">
                                            <span className="text-gray-500">
                                                Your answer: <span className={`font-bold ${ans.isCorrect ? 'text-green-600' : 'text-red-500'}`}>{ans.selected}</span>
                                            </span>
                                            {!ans.isCorrect && (
                                                <span className="text-gray-500">
                                                    Correct: <span className="font-bold text-green-600">{ans.correct}</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{ans.explanation}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Try Again */}
                <div className="max-w-2xl mx-auto px-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestart}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg"
                    >
                        🔄 Try Again!
                    </motion.button>
                </div>
            </div>
        );
    }

    // ─── QUIZ SCREEN ───
    const q = QUESTIONS[currentQ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pb-24">
            {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={200} />}

            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500"
                >
                    🧠 Square Root Quiz
                </motion.h1>
                <p className="text-gray-500 mt-2 text-lg">No rush — take your time! 💜</p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-xl mx-auto px-4 mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                    <span>Progress</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3">
                    <motion.div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentQ}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mx-4 border border-purple-200"
            >
                {/* Question */}
                <div className="text-center mb-8">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => speak(q.question)}
                        className="text-3xl mb-3 cursor-pointer"
                        title="Listen again"
                    >
                        🔊
                    </motion.button>
                    <h2 className="text-2xl font-bold text-gray-800">{q.question}</h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {q.options.map((option, i) => {
                        let cardStyle = `bg-gradient-to-br ${OPTION_COLORS[i]} border-2 border-purple-200 hover:border-purple-300`;
                        if (selected === option) {
                            cardStyle = 'bg-gradient-to-br from-purple-200 to-indigo-200 border-2 border-purple-500 ring-2 ring-purple-300 scale-105';
                        }

                        return (
                            <motion.button
                                key={option}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelect(option)}
                                className={`${cardStyle} rounded-2xl p-6 text-center cursor-pointer transition-all`}
                            >
                                <span className="text-xl font-bold text-gray-700">{option}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* NEXT Button (Only shows when selected) */}
                <AnimatePresence>
                    {selected !== null && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg"
                            >
                                {currentQ < QUESTIONS.length - 1 ? '➡️ Next Question' : '🏁 Finish Quiz'}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MathQuiz;
