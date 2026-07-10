"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
(0, node_test_1.default)('GET / returns API information', async () => {
    const app = (0, index_1.createApp)();
    const server = app.listen(0);
    await new Promise((resolve) => {
        server.once('listening', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Server did not bind to a port');
    }
    const response = await fetch(`http://127.0.0.1:${address.port}/`);
    const body = await response.json();
    strict_1.default.equal(response.status, 200);
    strict_1.default.equal(body.message, 'Octofit Tracker API');
    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
});
(0, node_test_1.default)('seeded API routes return data', async () => {
    await mongoose_1.default.connect('mongodb://localhost:27017/octofit_db');
    const app = (0, index_1.createApp)();
    const server = app.listen(0);
    await new Promise((resolve) => {
        server.once('listening', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Server did not bind to a port');
    }
    for (const path of ['/api/users/', '/api/teams/', '/api/activities/', '/api/leaderboard/', '/api/workouts/']) {
        const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
        const body = await response.json();
        strict_1.default.equal(response.status, 200);
        strict_1.default.ok(Array.isArray(body.data));
        strict_1.default.ok(body.data.length > 0);
    }
    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
    await mongoose_1.default.disconnect();
});
