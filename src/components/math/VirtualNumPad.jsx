import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VirtualNumPad — Bottom-sheet style numpad
 * Slides up from the bottom of the screen like a native keyboard.
 * No backdrop overlay so children can see changes in real-time.
 *
 * Props:
 *  - isOpen: boolean
 *  - onSelect(num): called when a number is tapped
 *  - onClose(): called when the close bar is tapped
 *  - currentValue: currently selected number (highlighted)
 *  - colorScheme: 'green' | 'blue' (to match Garden or BarChart theme)
 */

const THEMES = {
    green: {
        bg: 'bg-white',
        border: 'border-green-200',
        handle: 'bg-green-300',
        activeBtn: 'bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-4 ring-green-300 shadow-green-200',
        inactiveBtn: 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border-2 border-green-200 hover:border-green-400',
        closeBtn: 'text-green-500 hover:text-green-700',
    },
    blue: {
        bg: 'bg-white',
        border: 'border-blue-200',
        handle: 'bg-blue-300',
        activeBtn: 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white ring-4 ring-blue-300 shadow-blue-200',
        inactiveBtn: 'bg-gradient-to-br from-blue-50 to-sky-50 text-blue-700 border-2 border-blue-200 hover:border-blue-400',
        closeBtn: 'text-blue-500 hover:text-blue-700',
    },
};

const VirtualNumPad = ({ isOpen, onSelect, onClose, currentValue, colorScheme = 'green' }) => {
    const theme = THEMES[colorScheme] || THEMES.green;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className={`fixed bottom-0 left-0 right-0 z-50 ${theme.bg} rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t-2 ${theme.border}`}
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
                >
                    {/* ── Drag Handle / Close Bar ── */}
                    <button
                        onClick={onClose}
                        className="w-full flex flex-col items-center pt-3 pb-2 cursor-pointer group"
                        title="Close numpad"
                    >
                        <div className={`w-12 h-1.5 rounded-full ${theme.handle} group-hover:opacity-70 transition-opacity mb-1`} />
                        <span className={`text-xs font-semibold ${theme.closeBtn} transition-colors`}>
                            ▼ Tap to close
                        </span>
                    </button>

                    {/* ── Number Grid ── */}
                    <div className="px-4 pb-4">
                        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <motion.button
                                    key={num}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.88 }}
                                    onClick={() => onSelect(num)}
                                    className={`
                                        aspect-square rounded-2xl text-2xl font-extrabold
                                        flex items-center justify-center
                                        transition-colors shadow-md
                                        ${num === currentValue ? theme.activeBtn : theme.inactiveBtn}
                                    `}
                                >
                                    {num}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VirtualNumPad;
