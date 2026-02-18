import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useSpeech } from '../../hooks/useSpeech';
import { useStars } from '../../context/StarContext';

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const GardenGame = () => {
    const { speak } = useSpeech();
    const { addStar } = useStars();
    const [sliderValue, setSliderValue] = useState(1);
    const [problem, setProblem] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isSolved, setIsSolved] = useState(false);
    const [difficulty, setDifficulty] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    // Track window size for confetti
    useEffect(() => {
        const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch problem from server (fallback to local)
    const fetchProblem = useCallback(async (diffLevel) => {
        setLoading(true);
        setIsSolved(false);
        setSliderValue(1);
        setFeedback('');
        try {
            const res = await fetch(`http://localhost:4000/api/math/problem?difficulty=${DIFFICULTY_LEVELS[diffLevel]}`);
            const data = await res.json();
            setProblem(data);
        } catch {
            // Fallback problems if server is down
            const fallback = [
                { type: 'garden', totalPots: 9, root: 3, hint: 'Try 3 rows!' },
                { type: 'garden', totalPots: 25, root: 5, hint: 'Try 5 rows!' },
                { type: 'garden', totalPots: 49, root: 7, hint: 'Try 7 rows!' },
                { type: 'garden', totalPots: 64, root: 8, hint: 'Try 8 rows!' },
                { type: 'garden', totalPots: 81, root: 9, hint: 'Try 9 rows!' },
            ];
            setProblem(fallback[Math.floor(Math.random() * fallback.length)]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProblem(difficulty);
    }, [difficulty, fetchProblem]);

    // Welcome TTS on first problem load
    useEffect(() => {
        if (problem && !isSolved) {
            const timer = setTimeout(() => {
                speak(`Let's plant ${problem.totalPots} flowers. Move the slider to make a perfect square garden!`);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [problem, speak, isSolved]);

    // Check answer
    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setSliderValue(val);

        if (!problem) return;

        if (val * val === problem.totalPots) {
            setIsSolved(true);
            setShowConfetti(true);
            setScore((s) => s + 1);
            addStar();
            setFeedback(`🎉 Perfect! ${val} rows and ${val} columns make ${problem.totalPots}!`);
            speak(`Perfect! ${val} rows and ${val} columns make ${problem.totalPots}! The square root of ${problem.totalPots} is ${val}!`);
            setTimeout(() => setShowConfetti(false), 5000);
        } else if (val * val > problem.totalPots) {
            setFeedback(`Too many! ${val} × ${val} = ${val * val}. That's more than ${problem.totalPots}.`);
        } else {
            setFeedback(`Not enough! ${val} × ${val} = ${val * val}. We need ${problem.totalPots}.`);
        }
    };

    // Next problem
    const handleNext = () => {
        if (difficulty < DIFFICULTY_LEVELS.length - 1) {
            setDifficulty((d) => d + 1);
        } else {
            setDifficulty(0);
        }
    };

    // Render the flower grid
    const renderGrid = () => {
        if (!problem) return null;
        const cols = sliderValue;
        const rows = sliderValue;
        const total = cols * rows;
        const flowers = [];

        for (let i = 0; i < total; i++) {
            flowers.push(
                <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.01, type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center text-2xl"
                    style={{
                        width: `${Math.max(24, Math.min(48, 320 / cols))}px`,
                        height: `${Math.max(24, Math.min(48, 320 / cols))}px`,
                    }}
                >
                    {i < problem.totalPots ? '🌻' : '🟫'}
                </motion.div>
            );
        }

        return (
            <div
                className="grid gap-0.5 mx-auto"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    maxWidth: '360px',
                }}
            >
                {flowers}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="text-6xl"
                >
                    🌻
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
            {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={300} />}

            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500"
                >
                    🌻 The Square Garden
                </motion.h1>
                <p className="text-gray-500 mt-2 text-lg">Learn square roots by planting flowers!</p>
            </div>

            {/* Main Game Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mx-4 border border-green-200"
            >
                {/* Prompt */}
                <motion.div
                    key={problem?.totalPots}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-center mb-6"
                >
                    <p className="text-xl text-gray-700 font-medium">
                        We have <span className="text-3xl font-bold text-green-600">{problem?.totalPots}</span> flower pots.
                    </p>
                    <p className="text-gray-500 mt-1">Can you arrange them into a perfect square? 🌼</p>
                </motion.div>

                {/* Slider */}
                <div className="mb-6">
                    <label className="block text-center text-gray-600 font-semibold mb-2">
                        Rows & Columns: <span className="text-2xl text-green-600">{sliderValue}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        disabled={isSolved}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-green-200 to-emerald-300 accent-green-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                        {[...Array(10)].map((_, i) => (
                            <span key={i}>{i + 1}</span>
                        ))}
                    </div>
                </div>

                {/* Calculation Display */}
                <div className="text-center mb-4">
                    <span className="inline-block bg-green-50 px-4 py-2 rounded-xl border border-green-200 text-lg font-mono">
                        {sliderValue} × {sliderValue} = <span className={`font-bold ${sliderValue * sliderValue === problem?.totalPots ? 'text-green-600' : 'text-orange-500'}`}>{sliderValue * sliderValue}</span>
                    </span>
                </div>

                {/* Flower Grid */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 mb-4">
                    {renderGrid()}
                </div>

                {/* Feedback */}
                <AnimatePresence mode="wait">
                    {feedback && (
                        <motion.div
                            key={feedback}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className={`text-center p-4 rounded-2xl font-semibold text-lg ${isSolved
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-orange-50 text-orange-600 border border-orange-200'
                                }`}
                        >
                            {feedback}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hint Button */}
                {!isSolved && problem && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            speak(problem.hint);
                            setFeedback(`💡 Hint: ${problem.hint}`);
                        }}
                        className="mt-4 w-full py-3 bg-yellow-100 text-yellow-700 font-bold rounded-xl border-2 border-yellow-300 hover:bg-yellow-200 transition-colors"
                    >
                        💡 Need a Hint?
                    </motion.button>
                )}

                {/* Next Level Button */}
                {isSolved && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="mt-4 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        🌱 Next Garden! →
                    </motion.button>
                )}
            </motion.div>

            {/* Score Badge */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto mt-6 text-center"
            >
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-green-200">
                    <span className="text-2xl">🏆</span>
                    <span className="font-bold text-green-700 text-lg">Gardens Planted: {score}</span>
                </div>
            </motion.div>
        </div>
    );
};

export default GardenGame;
