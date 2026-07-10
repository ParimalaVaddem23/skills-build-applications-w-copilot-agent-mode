"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
    try {
        await mongoose_1.default.connect(connectionString);
        console.log('Connected to octofit_db');
        await Promise.all([
            models_1.User.deleteMany({}),
            models_1.Team.deleteMany({}),
            models_1.Activity.deleteMany({}),
            models_1.LeaderboardEntry.deleteMany({}),
            models_1.Workout.deleteMany({}),
        ]);
        const users = await models_1.User.create([
            {
                name: 'Mina Patel',
                email: 'mina@example.com',
                fitnessGoal: 'Improve endurance',
            },
            {
                name: 'Jordan Lee',
                email: 'jordan@example.com',
                fitnessGoal: 'Build strength',
            },
            {
                name: 'Ava Chen',
                email: 'ava@example.com',
                fitnessGoal: 'Increase flexibility',
            },
        ]);
        const team = await models_1.Team.create({
            name: 'River Runners',
            sport: 'Running',
            members: users.map((user) => user._id),
        });
        await models_1.User.updateMany({ _id: { $in: users.map((user) => user._id) } }, { teamId: team._id });
        await models_1.Activity.create([
            {
                userId: users[0]._id,
                type: 'Run',
                duration: 35,
                calories: 420,
                date: new Date('2026-07-09T06:00:00Z'),
            },
            {
                userId: users[1]._id,
                type: 'Strength',
                duration: 45,
                calories: 310,
                date: new Date('2026-07-09T07:30:00Z'),
            },
            {
                userId: users[2]._id,
                type: 'Yoga',
                duration: 30,
                calories: 180,
                date: new Date('2026-07-09T08:15:00Z'),
            },
        ]);
        await models_1.LeaderboardEntry.create([
            { userId: users[0]._id, score: 980, rank: 1 },
            { userId: users[1]._id, score: 912, rank: 2 },
            { userId: users[2]._id, score: 895, rank: 3 },
        ]);
        await models_1.Workout.create([
            {
                userId: users[0]._id,
                title: 'Tempo Run',
                difficulty: 'Intermediate',
                duration: 40,
                description: 'A brisk run focused on pacing and endurance.',
            },
            {
                userId: users[1]._id,
                title: 'Full Body Strength',
                difficulty: 'Advanced',
                duration: 50,
                description: 'Compound lifts to increase overall strength.',
            },
            {
                userId: users[2]._id,
                title: 'Mobility Flow',
                difficulty: 'Beginner',
                duration: 25,
                description: 'A gentle sequence designed to improve flexibility.',
            },
        ]);
        console.log('Database seeding complete');
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
seedDatabase();
