import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { ScreenCapture } from 'react-screen-capture';
import { useSpeech } from '../../hooks/useSpeech';
import { useStars } from '../../context/StarContext';
import { usePolaroidCapture } from '../../hooks/usePolaroidCapture';

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

    // Numpad — open by default
    const [numpadOpen, setNumpadOpen] = useState(true);

    // Polaroid capture (react-screen-capture)
    const { startCapture, handleEndCapture, isCapturing, flashVisible } = usePolaroidCapture();

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

    // Welcome TTS
    useEffect(() => {
        if (problem && !isSolved) {
            const timer = setTimeout(() => {
                speak(`Let's plant ${problem.totalPots} flowers. Move the slider to make a perfect square garden!`);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [problem, speak, isSolved]);

    // Core answer-checking logic (shared by slider & numpad)
    const checkAnswer = useCallback((val) => {
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
    }, [problem, speak, addStar]);

    // Slider handler
    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setSliderValue(val);
        checkAnswer(val);
    };

    // Numpad handler
    const handleNumpadSelect = (num) => {
        setSliderValue(num);
        checkAnswer(num);
    };

    // Next problem
    const handleNext = () => {
        if (difficulty < DIFFICULTY_LEVELS.length - 1) {
            setDifficulty((d) => d + 1);
        } else {
            setDifficulty(0);
        }
        setNumpadOpen(true); // Re-open numpad for next round
    };

    // Render the flower grid
    const renderGrid = () => {
        if (!problem) return null;
        const cols = sliderValue;
        const total = cols * cols;
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

    // Bubble position
    const bubbleLeftPercent = ((sliderValue - 1) / (10 - 1)) * 100;

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
        <ScreenCapture onEndCapture={handleEndCapture}>
            {({ onStartCapture }) => (
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
                    {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={300} />}

                    {/* Screen Flash Overlay (Polaroid) */}
                    <AnimatePresence>
                        {flashVisible && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                className="fixed inset-0 bg-white z-[100] pointer-events-none"
                            />
                        )}
                    </AnimatePresence>

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

                        {/* Slider with Floating Bubble */}
                        <div className="mb-6">
                            <label className="block text-center text-gray-600 font-semibold mb-2">
                                Rows & Columns: <span className="text-2xl text-green-600">{sliderValue}</span>
                            </label>

                            <div className="relative">
                                {/* Floating Tooltip Bubble */}
                                <motion.div
                                    className="absolute -top-10 pointer-events-none select-none"
                                    style={{ left: `${bubbleLeftPercent}%`, transform: 'translateX(-50%)' }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={sliderValue}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                >
                                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                                        {sliderValue} × {sliderValue} = {sliderValue * sliderValue}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-emerald-600" />
                                    </div>
                                </motion.div>

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

                            {/* Toggle Button for Number Pad */}
                            <button
                                onClick={() => setNumpadOpen((prev) => !prev)}
                                className="mt-3 w-full py-2 text-sm font-semibold rounded-xl border-2 transition-colors bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            >
                                {numpadOpen ? '⌨️ Hide Number Pad' : '⌨️ Show Number Pad'}
                            </button>

                            {/* Inline Number Pad */}
                            {numpadOpen && (
                                <div className="mt-3 grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <motion.button
                                            key={num}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleNumpadSelect(num)}
                                            disabled={isSolved}
                                            className={`
                                        aspect-square rounded-2xl text-xl font-extrabold
                                        flex items-center justify-center shadow-md transition-colors
                                        ${num === sliderValue
                                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-3 ring-green-300'
                                                    : 'bg-green-50 text-green-700 border-2 border-green-200 hover:border-green-400'
                                                }
                                        disabled:opacity-40
                                    `}
                                        >
                                            {num}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
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

                        {/* Polaroid Camera Button (visible when solved) */}
                        {isSolved && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.08, rotate: -3 }}
                                whileTap={{ scale: 0.92 }}
                                disabled={isCapturing}
                                onClick={() => startCapture(onStartCapture)}
                                className="mt-4 w-full py-3 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 font-bold rounded-xl border-2 border-amber-300 hover:border-amber-400 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span className="text-xl">📸</span>
                                {isCapturing ? 'Saving...' : 'Save My Garden Polaroid!'}
                            </motion.button>
                        )}

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
            )}
        </ScreenCapture>
    );
};

export default GardenGame;
