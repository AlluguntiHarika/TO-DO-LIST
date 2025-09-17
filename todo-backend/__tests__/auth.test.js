const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  process.env.NODE_ENV = 'test';
  app = require('../server');
  // Wait for mongoose to connect to the in-memory server
  await mongoose.connection.asPromise();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

describe('Auth signup/login', () => {
  test('signup creates a new user', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ username: 'alice', email: 'alice@example.com', password: 'Passw0rd!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  test('signup blocks duplicate email', async () => {
    await request(app)
      .post('/api/signup')
      .send({ username: 'bob', email: 'dup@example.com', password: 'secret' });

    const res = await request(app)
      .post('/api/signup')
      .send({ username: 'bob2', email: 'dup@example.com', password: 'secret' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('login succeeds by username', async () => {
    await request(app)
      .post('/api/signup')
      .send({ username: 'charlie', email: 'charlie@example.com', password: 'secret' });

    const res = await request(app)
      .post('/api/login')
      .send({ username: 'charlie', password: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user.username', 'charlie');
  });

  test('login succeeds by email', async () => {
    await request(app)
      .post('/api/signup')
      .send({ username: 'dave', email: 'dave@example.com', password: 'secret' });

    const res = await request(app)
      .post('/api/login')
      .send({ username: 'dave@example.com', password: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user.email', 'dave@example.com');
  });

  test('login fails with wrong password', async () => {
    await request(app)
      .post('/api/signup')
      .send({ username: 'eve', email: 'eve@example.com', password: 'correct' });

    const res = await request(app)
      .post('/api/login')
      .send({ username: 'eve', password: 'wrong' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});


