import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { createApp } from './index';

test('seeded API routes return data', async () => {
  await mongoose.connect('mongodb://localhost:27017/octofit_db');

  const app = createApp();
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once('listening', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server did not bind to a port');
  }

  for (const path of ['/api/users/', '/api/teams/', '/api/activities/', '/api/leaderboard/', '/api/workouts/']) {
    const response: Response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  await mongoose.disconnect();
});
