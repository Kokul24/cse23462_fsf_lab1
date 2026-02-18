import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSpeech } from '../../hooks/useSpeech';

const modules = [
    {
        title: 'The Square Garden',
        emoji: '🌻',
        description: 'Plant flowers in perfect square grids! Learn square roots the fun way.',
        path: '/math/garden',
        gradient: 'from-green-100 to-emerald-100',
        border: 'border-green-300',
        textColor: 'text-green-700',
        tag: 'Learn',
    },
    {
        title: 'Match the Bars',
        emoji: '📊',
        description: 'Compare bars on a chart. Make your garden match the target!',
        path: '/math/visualize',
        gradient: 'from-blue-100 to-sky-100',
        border: 'border-blue-300',
        textColor: 'text-blue-700',
        tag: 'Visualize',
    },
    {
        title: 'Maths Knowledge',
        emoji: '🧠',
        description: 'Test your math skills with fun questions. No timer, no rush!',
        path: '/math/quiz',
        gradient: 'from-purple-100 to-pink-100',
        border: 'border-purple-300',
        textColor: 'text-purple-700',
        tag: 'Test',
    },
];

const MathsHub = () => {
    const { speak } = useSpeech();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            speak('Welcome to the Maths Garden! Choose a module to start learning.');
        }, 500);
        return () => clearTimeout(timer);
    }, [speak]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
            {/* Header */}
            <div className="text-center pt-10 pb-8">
                <motion.h1
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500"
                >
                    🌿 Maths Garden
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mt-3 text-lg max-w-md mx-auto"
                >
                    Learn → Visualize → Test
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 mt-1"
                >
                    Explore square roots through fun games! 🌻
                </motion.p>
            </div>

            {/* Module Cards */}
            <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {modules.map((mod, i) => (
                    <motion.div
                        key={mod.path}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
                    >
                        <Link to={mod.path} className="block">
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`bg-gradient-to-br ${mod.gradient} border-2 ${mod.border} rounded-3xl p-8 text-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow h-full`}
                            >
                                <div className="text-6xl mb-4">{mod.emoji}</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${mod.textColor} bg-white/60 mb-3`}>
                                    {mod.tag}
                                </span>
                                <h2 className={`text-2xl font-bold ${mod.textColor} mb-2`}>{mod.title}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">{mod.description}</p>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Pedagogy Flow Visual */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="max-w-2xl mx-auto mt-10 px-4"
            >
                <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gray-500">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full border border-green-300">🌻 Learn</span>
                    <span className="text-2xl">→</span>
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full border border-blue-300">📊 Visualize</span>
                    <span className="text-2xl">→</span>
                    <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full border border-purple-300">🧠 Test</span>
                </div>
            </motion.div>
        </div>
    );
};

export default MathsHub;
