import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobs } from '../jobsData';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';
import { ScreenCapture } from 'react-screen-capture';
import { usePolaroidCapture } from '../hooks/usePolaroidCapture';

const questions = [
    { id: 1, text: "Who grows our fresh food?", answerId: "farmer" },
    { id: 2, text: "Who puts out dangerous fires?", answerId: "firefighter" },
    { id: 3, text: "Who helps us when we are sick?", answerId: "doctor" },
    { id: 4, text: "Who flies into outer space?", answerId: "astronaut" },
    { id: 5, text: "Who cooks delicious meals?", answerId: "chef" },
    { id: 6, text: "Who teaches students in school?", answerId: "teacher" },
    { id: 7, text: "Who builds houses and buildings?", answerId: "builder" },
    { id: 8, text: "Who keeps our city safe?", answerId: "police" },
];

const Quiz = () => {
    const navigate = useNavigate();
    const { speak } = useTTS();

    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [lockInput, setLockInput] = useState(false);

    const { startCapture, handleEndCapture, isCapturing, flashVisible } = usePolaroidCapture({
        filename: 'my-quiz-results.png',
    });

    const currentQuestion = questions[currentQIndex];

    useEffect(() => {
        if (!isFinished && currentQuestion) {
            speak(`Question ${currentQIndex + 1}. ${currentQuestion.text}`);
        } else if (isFinished) {
            const score = userAnswers.filter(a => a.isCorrect).length;
            speak(`Quiz finished! You scored ${score} out of ${questions.length}. Let's see how you did.`);
        }
    }, [currentQIndex, isFinished, speak]);

    const handleAnswer = (jobId) => {
        if (lockInput || isFinished) return;
        setLockInput(true);

        const isCorrect = jobId === currentQuestion.answerId;

        speak("Selected");
        new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/assets/soundboard/click.ogg').play().catch(e => { });

        const newAnswer = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            correctAnswerId: currentQuestion.answerId,
            selectedAnswerId: jobId,
            isCorrect
        };
        const updatedAnswers = [...userAnswers, newAnswer];
        setUserAnswers(updatedAnswers);

        setTimeout(() => {
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
                setLockInput(false);
            } else {
                setIsFinished(true);
            }
        }, 1000);
    };

    const restartQuiz = () => {
        setCurrentQIndex(0);
        setUserAnswers([]);
        setIsFinished(false);
        setLockInput(false);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const questionVariants = {
        hidden: { y: -100, opacity: 0, scale: 0.8 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };

    const optionVariants = {
        hidden: (index) => ({
            opacity: 0,
            x: index % 2 === 0 ? -100 : 100,
            y: index < 2 ? -50 : 50,
            scale: 0.5
        }),
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 10,
                stiffness: 100
            }
        }
    };

    const resultItemVariants = {
        hidden: (index) => ({
            opacity: 0,
            x: index % 2 === 0 ? -50 : 50,
            scale: 0.9
        }),
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };

    // --- RENDER RESULTS SCREEN ---
    if (isFinished) {
        const score = userAnswers.filter(a => a.isCorrect).length;
        return (
            <ScreenCapture onEndCapture={handleEndCapture}>
                {({ onStartCapture }) => (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 p-6 flex flex-col items-center pb-20"
            >
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
                <motion.h1
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-8 drop-shadow-lg"
                >
                    Quiz Results 📝
                </motion.h1>

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                    className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center mb-10 border-4 border-gradient-to-r from-purple-400 to-pink-400"
                >
                    <motion.h2
                        className="text-4xl font-bold mb-3 text-gray-800"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    >
                        You Scored: <span className="text-green-600">{score}</span> / {questions.length}
                    </motion.h2>
                    <p className="text-xl text-gray-600">
                        {score === questions.length ? "Perfect Score! 🌟🎉" : "Good try! Keep learning! 📚✨"}
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-2xl space-y-4"
                >
                    {userAnswers.map((ans, idx) => {
                        const correctJob = jobs.find(j => j.id === ans.correctAnswerId);
                        const selectedJob = jobs.find(j => j.id === ans.selectedAnswerId);

                        return (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={resultItemVariants}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className={`p-5 rounded-2xl border-l-8 shadow-lg flex items-center justify-between bg-white
                                ${ans.isCorrect ? 'border-green-500' : 'border-red-400'} overflow-hidden relative`}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 opacity-5 ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                <div className="flex-1 relative z-10">
                                    <p className="text-gray-500 text-sm font-bold mb-1">Question {idx + 1}</p>
                                    <p className="text-lg font-semibold text-gray-800 mb-3">{ans.questionText}</p>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-sm text-gray-600">You picked:</span>
                                        <span className="flex items-center gap-2 font-bold bg-gray-100 px-3 py-2 rounded-lg shadow-sm">
                                            <span className="text-2xl">{selectedJob.icon}</span>
                                            <span>{selectedJob.title}</span>
                                        </span>
                                        {ans.isCorrect ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
                                            >
                                                <CheckCircle className="text-green-500" size={28} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
                                            >
                                                <XCircle className="text-red-500" size={28} />
                                            </motion.div>
                                        )}
                                    </div>

                                    {!ans.isCorrect && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 + 0.5 }}
                                            className="mt-3 text-sm bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2"
                                        >
                                            <span className="text-green-700 font-semibold">Correct answer:</span>
                                            <span className="flex items-center gap-1 font-bold text-green-800">
                                                <span className="text-xl">{correctJob.icon}</span>
                                                {correctJob.title}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="fixed bottom-6 flex gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xl font-bold text-white bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        <ArrowLeft /> Home
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={restartQuiz}
                        className="flex items-center gap-2 text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        <RotateCcw /> Retry
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: -3 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isCapturing}
                        onClick={() => startCapture(onStartCapture)}
                        className="flex items-center gap-2 text-xl font-bold text-white bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        📸 {isCapturing ? 'Saving...' : 'Save Results!'}
                    </motion.button>
                </motion.div>
            </motion.div>
                )}
            </ScreenCapture>
        );
    }

    // --- RENDER GAME SCREEN ---
    return (
        <motion.div
            key={currentQIndex}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex flex-col items-center p-6 pb-20"
        >
            <motion.button
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="self-start mb-6 flex items-center gap-2 text-xl font-bold text-gray-700 hover:text-gray-900 bg-white px-5 py-3 rounded-full shadow-lg"
            >
                <ArrowLeft /> Quit
            </motion.button>

            {/* Header / Counter */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-4xl flex justify-between items-end mb-8"
            >
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-sm">
                    Question {currentQIndex + 1} <span className="text-2xl text-gray-400">/ {questions.length}</span>
                </h1>
            </motion.div>

            {/* Question Card */}
            <motion.div
                variants={questionVariants}
                className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-3xl text-center mb-10 border-4 border-orange-200 cursor-pointer hover:border-orange-400 transition-all relative overflow-hidden"
                onClick={() => speak(currentQuestion.text)}
                whileHover={{ scale: 1.02 }}
            >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-orange-200 to-transparent rounded-br-full opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-200 to-transparent rounded-tl-full opacity-50"></div>

                <h2 className="text-4xl font-bold text-gray-800 relative z-10">{currentQuestion.text}</h2>
            </motion.div>

            {/* Options Grid */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl"
            >
                {jobs.map((job, index) => {
                    const isSelected = lockInput && userAnswers[userAnswers.length - 1]?.selectedAnswerId === job.id;

                    let bgClass = "bg-white border-gray-200";
                    if (isSelected) {
                        bgClass = "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-500 ring-4 ring-blue-300";
                    }

                    return (
                        <motion.div
                            key={job.id}
                            custom={index}
                            variants={optionVariants}
                            whileHover={!lockInput ? { scale: 1.08, y: -5, rotate: [0, -2, 2, 0] } : {}}
                            whileTap={!lockInput ? { scale: 0.95 } : {}}
                            onClick={() => handleAnswer(job.id)}
                            onMouseEnter={() => !lockInput && speak(job.title)}
                            className={`${bgClass} rounded-2xl p-6 flex flex-col items-center cursor-pointer shadow-lg border-b-4 transition-all duration-300 relative overflow-hidden`}
                        >
                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"
                                animate={{
                                    x: [-100, 200],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                            />

                            <motion.span
                                className="text-7xl mb-3 filter drop-shadow-md z-10"
                                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                            >
                                {job.icon}
                            </motion.span>
                            <span className="font-bold text-gray-700 text-lg z-10">{job.title}</span>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="h-10"></div>
        </motion.div>
    );
};

export default Quiz;
