import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { Activity, LeaderboardEntry, Team, User, Workout } from './models';

const port = Number(process.env.PORT || 8000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
  }
}

export function createApp() {
  const app = express();

  app.use(express.json());

  const codespaceName = process.env.CODESPACE_NAME;
  const apiBaseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Octofit Tracker API',
      apiBaseUrl,
      endpoints: ['/api/health', '/api/users/', '/api/teams/', '/api/activities/', '/api/leaderboard/', '/api/workouts/'],
    });
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', apiBaseUrl });
  });

  app.get('/api/users/', async (_req: Request, res: Response) => {
    await ensureDatabaseConnection();
    const users = await User.find({}).lean();
    res.json({ resource: 'users', data: users, apiBaseUrl });
  });

  app.get('/api/teams/', async (_req: Request, res: Response) => {
    await ensureDatabaseConnection();
    const teams = await Team.find({}).lean();
    res.json({ resource: 'teams', data: teams, apiBaseUrl });
  });

  app.get('/api/activities/', async (_req: Request, res: Response) => {
    await ensureDatabaseConnection();
    const activities = await Activity.find({}).sort({ date: -1 }).lean();
    res.json({ resource: 'activities', data: activities, apiBaseUrl });
  });

  app.get('/api/leaderboard/', async (_req: Request, res: Response) => {
    await ensureDatabaseConnection();
    const leaderboard = await LeaderboardEntry.find({}).sort({ rank: 1 }).lean();
    res.json({ resource: 'leaderboard', data: leaderboard, apiBaseUrl });
  });

  app.get('/api/workouts/', async (_req: Request, res: Response) => {
    await ensureDatabaseConnection();
    const workouts = await Workout.find({}).lean();
    res.json({ resource: 'workouts', data: workouts, apiBaseUrl });
  });

  return app;
}

export function startServer() {
  const app = createApp();

  mongoose
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
