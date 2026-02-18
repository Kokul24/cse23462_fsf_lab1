import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useSpeech } from '../../hooks/useSpeech';
import { useStars } from '../../context/StarContext';

const TARGETS = [4, 9, 16, 25, 36, 49, 64, 81, 100];

const BarChartVisual = () => {
    const { speak } = useSpeech();
    const { addStar } = useStars();
    const [sliderValue, setSliderValue] = useState(1);
    const [targetIndex, setTargetIndex] = useState(0);
    const [matched, setMatched] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [shake, setShake] = useState(false);
    const [score, setScore] = useState(0);
    const lastSpoken = useRef('');
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    const target = TARGETS[targetIndex];
    const myValue = sliderValue * sliderValue;

    useEffect(() => {
        const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Welcome TTS
    useEffect(() => {
        const timer = setTimeout(() => {
            speak(`Match the bars! The target garden has ${target} flowers. Slide to find the square root.`);
        }, 500);
        return () => clearTimeout(timer);
    }, [target, speak]);

    const provideFeedback = useCallback((val) => {
        const sq = val * val;
        if (sq === target) {
            if (lastSpoken.current !== 'match') {
                setMatched(true);
                setShowConfetti(true);
                setScore((s) => s + 1);
                addStar();
                speak(`Amazing! ${val} times ${val} equals ${target}. You matched it perfectly!`);
                lastSpoken.current = 'match';
                setTimeout(() => setShowConfetti(false), 5000);
            }
        } else if (sq < target) {
            if (lastSpoken.current !== 'small') {
                setShake(true);
                speak('A bit more! Make it taller.');
                lastSpoken.current = 'small';
                setTimeout(() => setShake(false), 500);
            }
        } else {
            if (lastSpoken.current !== 'big') {
                setShake(true);
                speak('Whoops, too tall! Make it smaller.');
                lastSpoken.current = 'big';
                setTimeout(() => setShake(false), 500);
            }
        }
    }, [target, speak, addStar]);

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setSliderValue(val);
        lastSpoken.current = '';
        provideFeedback(val);
    };

    const handleNext = () => {
        setTargetIndex((i) => (i + 1) % TARGETS.length);
        setSliderValue(1);
        setMatched(false);
        lastSpoken.current = '';
    };

    const chartData = [
        { name: '🎯 Target', value: target, label: `${target}` },
        { name: '🌻 My Garden', value: myValue, label: `${sliderValue}×${sliderValue} = ${myValue}` },
    ];

    const getBarColor = () => {
        if (myValue === target) return '#22c55e';
        if (myValue < target) return '#fb923c';
        return '#ef4444';
    };

    const getFeedbackEmoji = () => {
        if (myValue === target) return '✅';
        if (myValue < target) return '📏 Too Short';
        return '📐 Too Tall';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 pb-24">
            {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} recycle={false} numberOfPieces={250} />}

            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <motion.h1
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"
                >
                    📊 Match the Bars!
                </motion.h1>
                <p className="text-gray-500 mt-2 text-lg">Make your garden bar reach the target!</p>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mx-4 border border-blue-200"
            >
                {/* Target Info */}
                <div className="text-center mb-6">
                    <p className="text-xl text-gray-700">
                        Target Garden: <span className="text-3xl font-bold text-blue-600">{target}</span> flowers
                    </p>
                    <p className="text-gray-400 mt-1">Find the number that, multiplied by itself, equals {target}</p>
                </div>

                {/* Bar Chart */}
                <motion.div
                    animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-2xl border border-blue-100 mb-6"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#475569', fontWeight: 600, fontSize: 14 }}
                            />
                            <YAxis
                                domain={[0, Math.max(target, myValue) + 10]}
                                tick={{ fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={600}>
                                <Cell fill="#3b82f6" />
                                <Cell fill={getBarColor()} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Slider */}
                <div className="mb-6">
                    <label className="block text-center text-gray-600 font-semibold mb-2">
                        Your Number: <span className="text-2xl text-blue-600">{sliderValue}</span>
                        <span className="ml-3 text-gray-400">({sliderValue} × {sliderValue} = {myValue})</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        disabled={matched}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-blue-200 to-cyan-300 accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                        {[...Array(10)].map((_, i) => (
                            <span key={i}>{i + 1}</span>
                        ))}
                    </div>
                </div>

                {/* Feedback Badge */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={getFeedbackEmoji()}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`text-center p-4 rounded-2xl font-semibold text-lg ${matched
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : myValue < target
                                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                    : 'bg-red-50 text-red-500 border border-red-200'
                            }`}
                    >
                        {matched
                            ? `🎉 Perfect Match! √${target} = ${sliderValue}`
                            : `${getFeedbackEmoji()} → ${sliderValue}² = ${myValue} (Target: ${target})`}
                    </motion.div>
                </AnimatePresence>

                {/* Next */}
                {matched && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="mt-4 w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        📊 Next Challenge! →
                    </motion.button>
                )}
            </motion.div>

            {/* Score */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto mt-6 text-center"
            >
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-blue-200">
                    <span className="text-2xl">🏆</span>
                    <span className="font-bold text-blue-700 text-lg">Bars Matched: {score}</span>
                </div>
            </motion.div>
        </div>
    );
};

export default BarChartVisual;
