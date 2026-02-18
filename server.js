import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ──────────────────── Data File ────────────────────
const DATA_FILE = path.join(__dirname, 'math_progress.json');

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch {
        return { users: {} };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ──────────────────── Problem Bank ────────────────────
const PROBLEMS = {
    easy: [
        { type: 'garden', totalPots: 4, root: 2, hint: 'Try 2 rows!' },
        { type: 'garden', totalPots: 9, root: 3, hint: 'Try 3 rows!' },
        { type: 'garden', totalPots: 16, root: 4, hint: 'Try 4 rows!' },
    ],
    medium: [
        { type: 'garden', totalPots: 25, root: 5, hint: 'Try 5 rows!' },
        { type: 'garden', totalPots: 36, root: 6, hint: 'Try 6 rows!' },
        { type: 'garden', totalPots: 49, root: 7, hint: 'Try 7 rows!' },
    ],
    hard: [
        { type: 'garden', totalPots: 64, root: 8, hint: 'Try 8 rows!' },
        { type: 'garden', totalPots: 81, root: 9, hint: 'Try 9 rows!' },
        { type: 'garden', totalPots: 100, root: 10, hint: 'Try 10 rows!' },
    ],
};

// ──────────────────── GET /api/math/problem ────────────────────
app.get('/api/math/problem', (req, res) => {
    const difficulty = req.query.difficulty || 'easy';
    const pool = PROBLEMS[difficulty] || PROBLEMS.easy;
    const problem = pool[Math.floor(Math.random() * pool.length)];
    res.json(problem);
});

// ──────────────────── POST /api/math/save-progress ────────────────────
app.post('/api/math/save-progress', (req, res) => {
    const { userId = 'default', score, totalQuestions } = req.body;

    const data = readData();
    if (!data.users[userId]) {
        data.users[userId] = { scores: [], badges: [], highScore: 0 };
    }

    const user = data.users[userId];
    const percentage = Math.round((score / totalQuestions) * 100);
    user.scores.push({ score, totalQuestions, percentage, date: new Date().toISOString() });

    if (percentage > user.highScore) {
        user.highScore = percentage;
    }

    // Award "Master Gardener Badge" for a perfect score
    if (percentage === 100 && !user.badges.includes('Master Gardener Badge')) {
        user.badges.push('Master Gardener Badge');
    }

    // Additional badge tiers
    if (percentage >= 80 && !user.badges.includes('Green Thumb Badge')) {
        user.badges.push('Green Thumb Badge');
    }
    if (percentage >= 60 && !user.badges.includes('Budding Gardener Badge')) {
        user.badges.push('Budding Gardener Badge');
    }

    writeData(data);

    res.json({
        message: 'Progress saved!',
        percentage,
        badges: user.badges,
        highScore: user.highScore,
    });
});

// ──────────────────── GET /api/math/progress ────────────────────
app.get('/api/math/progress', (req, res) => {
    const userId = req.query.userId || 'default';
    const data = readData();
    const user = data.users[userId] || { scores: [], badges: [], highScore: 0 };
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`🌻 Maths Garden Server running on http://localhost:${PORT}`);
});
