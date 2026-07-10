"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("./models");
const port = Number(process.env.PORT || 8000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
async function ensureDatabaseConnection() {
    if (mongoose_1.default.connection.readyState !== 1) {
        await mongoose_1.default.connect(mongoUri);
    }
}
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const codespaceName = process.env.CODESPACE_NAME;
    const apiBaseUrl = codespaceName
        ? `https://${codespaceName}-8000.app.github.dev`
        : 'http://localhost:8000';
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', apiBaseUrl });
    });
    app.get('/api/users/', async (_req, res) => {
        await ensureDatabaseConnection();
        const users = await models_1.User.find({}).lean();
        res.json({ resource: 'users', data: users, apiBaseUrl });
    });
    app.get('/api/teams/', async (_req, res) => {
        await ensureDatabaseConnection();
        const teams = await models_1.Team.find({}).lean();
        res.json({ resource: 'teams', data: teams, apiBaseUrl });
    });
    app.get('/api/activities/', async (_req, res) => {
        await ensureDatabaseConnection();
        const activities = await models_1.Activity.find({}).sort({ date: -1 }).lean();
        res.json({ resource: 'activities', data: activities, apiBaseUrl });
    });
    app.get('/api/leaderboard/', async (_req, res) => {
        await ensureDatabaseConnection();
        const leaderboard = await models_1.LeaderboardEntry.find({}).sort({ rank: 1 }).lean();
        res.json({ resource: 'leaderboard', data: leaderboard, apiBaseUrl });
    });
    app.get('/api/workouts/', async (_req, res) => {
        await ensureDatabaseConnection();
        const workouts = await models_1.Workout.find({}).lean();
        res.json({ resource: 'workouts', data: workouts, apiBaseUrl });
    });
    return app;
}
function startServer() {
    const app = createApp();
    mongoose_1.default
        .connect(mongoUri)
        .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, '0.0.0.0', () => {
            console.log(`Backend listening on port ${port}`);
            console.log(`API base URL: ${apiBaseUrl}`);
        });
    })
        .catch((error) => {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    });
}
const apiBaseUrl = process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-8000.app.github.dev`
    : 'http://localhost:8000';
if (require.main === module) {
    startServer();
}
