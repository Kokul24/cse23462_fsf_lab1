import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Station from './components/Station';
import JobActivity from './components/JobActivity';
import Quiz from './components/Quiz';
import ScenarioSolver from './components/ScenarioSolver';
import Navigation from './components/Navigation';
import { StarProvider } from './context/StarContext';
import './StarAnimation.css';

// Maths Garden Module
import MathsHub from './components/math/MathsHub';
import GardenGame from './components/math/GardenGame';
import BarChartVisual from './components/math/BarChartVisual';
import MathQuiz from './components/math/MathQuiz';

function App() {
  return (
    <StarProvider>
      <Router>
        <Navigation />

        <div className="pt-4">
          <Routes>
            <Route path="/" element={<Station />} />
            <Route path="/job/:id" element={<JobActivity />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/scenario" element={<ScenarioSolver />} />

            {/* Maths Garden Routes */}
            <Route path="/math" element={<MathsHub />} />
            <Route path="/math/garden" element={<GardenGame />} />
            <Route path="/math/visualize" element={<BarChartVisual />} />
            <Route path="/math/quiz" element={<MathQuiz />} />
          </Routes>
        </div>
      </Router>
    </StarProvider>
  );
}

export default App;
