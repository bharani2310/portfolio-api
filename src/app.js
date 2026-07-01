import express from 'express';
import cors from 'cors';

import profileRoutes from './routes/profileRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import skillsRoutes from './routes/skillsRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import allDataRoutes from './routes/allDataRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/all', allDataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Only image files are allowed.') {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
