import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStars } from '../context/StarContext';
import { Star, Home, Gamepad2, FileQuestion, Flower2, BarChart3, Brain } from 'lucide-react';

const Navigation = () => {
    const { stars } = useStars();

    const activeStyle = "bg-blue-600 text-white shadow-lg scale-105";
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-600 text-sm";

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-md px-4 py-3 flex justify-between items-center border-b border-gray-100">
            {/* Logo / Title */}
            <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    AuSome Journey 🚂
                </span>
            </div>

            {/* Center Tabs */}
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200">
                <NavLink
                    to="/"
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
                    end
                >
                    <Home size={16} />
                    <span>Station</span>
                </NavLink>

                <NavLink
                    to="/quiz"
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
                >
                    <Gamepad2 size={16} />
                    <span>Quiz</span>
                </NavLink>

                <NavLink
                    to="/scenario"
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
                >
                    <FileQuestion size={16} />
                    <span>Scenario</span>
                </NavLink>

                {/* Maths Garden Links */}
                <NavLink
                    to="/math/garden"
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
                >
                    <Flower2 size={16} />
                    <span>Maths Learn</span>
                </NavLink>

                <NavLink
                    to="/math/visualize"
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
                >
                    <BarChart3 size={16} />
                    <span>Maths Visualize</span>
                </NavLink>

                <NavLink
                    to="/math/quiz"
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
                >
                    <Brain size={16} />
                    <span>Square Root Quiz</span>
                </NavLink>
            </div>

            {/* Star Counter (Integrated) */}
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full border-2 border-yellow-400">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="text-xl font-bold text-yellow-700 font-mono">{stars}</span>
            </div>
        </nav>
    );
};

export default Navigation;
