import 'dotenv/config';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

import Profile from '../models/Profile.js';
import Experience from '../models/Experience.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Admin from '../models/Admin.js';

async function fetchImage(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return {
    data: Buffer.from(arrayBuffer),
    contentType: res.headers.get('content-type') || 'image/jpeg',
  };
}

async function seed() {
  await connectDB();

  await Promise.all([
    Profile.deleteMany({}),
    Experience.deleteMany({}),
    Skill.deleteMany({}),
    Project.deleteMany({}),
  ]);

  const profileImageData = await fetchImage(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'
  );

  await Profile.create({
    name: 'Alex Carter',
    role: 'Full Stack Developer',
    description:
      'I build fast, accessible web apps end to end — from REST APIs to polished, animated interfaces.',
    professionalSummary:
      'Over 5 years building production web applications across fintech and SaaS, focused on React, Node.js, and clean system design.',
    currentCompany: 'Nimbus Labs',
    location: 'Remote',
    profileImageData,
    resumeLink: 'https://example.com/resume.pdf',
    socialLinks: {
      github: 'https://github.com/example',
      linkedin: 'https://linkedin.com/in/example',
      twitter: 'https://twitter.com/example',
      email: 'mailto:alex@example.com',
    },
  });

  await Experience.insertMany([
    {
      companyName: 'Nimbus Labs',
      order: 1,
      technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
      roles: [
        {
          role: 'Junior Software Engineer',
          startDate: new Date('2021-06-01'),
          endDate: new Date('2022-12-31'),
          description: 'Built internal tooling and contributed to the core dashboard redesign.',
        },
        {
          role: 'Senior Full Stack Developer',
          startDate: new Date('2023-01-01'),
          endDate: null,
          description: 'Leading the platform team rebuilding the core dashboard in React and Node.js.',
        },
      ],
    },
    {
      companyName: 'Brightline Systems',
      order: 2,
      technologies: ['Express', 'PostgreSQL', 'Docker'],
      roles: [
        {
          role: 'Full Stack Developer',
          startDate: new Date('2019-07-01'),
          endDate: new Date('2021-05-31'),
          description: 'Built internal tooling and customer-facing APIs serving 50k+ daily users.',
        },
      ],
    },
  ]);

  await Skill.insertMany([
    {
      category: 'Frontend',
      order: 1,
      items: [
        { name: 'React', level: 95 },
        { name: 'JavaScript', level: 92 },
        { name: 'Tailwind CSS', level: 90 },
        { name: 'Framer Motion', level: 80 },
      ],
    },
    {
      category: 'Backend',
      order: 2,
      items: [
        { name: 'Node.js', level: 90 },
        { name: 'Express', level: 88 },
        { name: 'REST APIs', level: 90 },
      ],
    },
    {
      category: 'Database & Tools',
      order: 3,
      items: [
        { name: 'MongoDB', level: 85 },
        { name: 'PostgreSQL', level: 75 },
        { name: 'Docker', level: 70 },
        { name: 'Git', level: 92 },
      ],
    },
  ]);

  const [img1, img2, img3] = await Promise.all([
    fetchImage('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop'),
    fetchImage('https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop'),
    fetchImage('https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=500&fit=crop'),
  ]);

  await Project.insertMany([
    {
      title: 'Nimbus Analytics Dashboard',
      description: 'Real-time analytics dashboard with role-based access and live charts.',
      details:
        'A full rebuild of the company analytics product: React front end, Node/Express API, MongoDB aggregation pipelines, and WebSocket-driven live updates. Reduced average load time by 40%.',
      imageData: img1,
      technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
      githubLink: 'https://github.com/example/nimbus-dashboard',
      liveLink: 'https://example.com',
      order: 1,
    },
    {
      title: 'Brightline API Gateway',
      description: 'Centralized API gateway with auth, rate limiting, and request logging.',
      details:
        'Designed and implemented an internal API gateway in front of 12 microservices, adding JWT auth, per-client rate limiting, and structured logging for observability.',
      imageData: img2,
      technologies: ['Express', 'Redis', 'PostgreSQL'],
      githubLink: 'https://github.com/example/brightline-gateway',
      liveLink: '',
      order: 2,
    },
    {
      title: 'Pixel Forge Portfolio Builder',
      description: 'Drag-and-drop portfolio site builder for freelance designers.',
      details:
        'A no-code site builder letting freelancers assemble a portfolio from themed blocks, with live preview, custom domains, and animated section transitions.',
      imageData: img3,
      technologies: ['React', 'Framer Motion', 'Tailwind CSS'],
      githubLink: 'https://github.com/example/portfolio-builder',
      liveLink: 'https://example.com',
      order: 3,
    },
  ]);

  const existingAdmin = await Admin.findOne();
  if (!existingAdmin) {
    const passwordHash = await Admin.hashPassword('12345');
    await Admin.create({ name: 'Bharanidharan T C', email: 'bharanidharan0909@gmail.com', passwordHash });
    console.log('Default admin created!');
    console.log('Change this immediately via the admin dashboard or: npm run admin:reset-password');
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
