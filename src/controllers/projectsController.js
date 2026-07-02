import Project from '../models/Project.js';
import { refreshMiddlewareCache } from '../services/notifyMiddleware.js';

function withAbsoluteImageUrl(req, projectJson) {
  if (projectJson.image) {
    projectJson.image = `${req.protocol}://${req.get('host')}${projectJson.image}`;
  }
  return projectJson;
}

export async function getProjects(req, res) {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.json(projects.map((p) => withAbsoluteImageUrl(req, p.toJSON())));
}

export async function getProjectById(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(withAbsoluteImageUrl(req, project.toJSON()));
}

export async function getProjectImage(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project?.imageData?.data) return res.status(404).end();
  res.set('Content-Type', project.imageData.contentType);
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(project.imageData.data);
}

// --- Admin-only ---

export async function createProject(req, res) {
  const { title, description, technologies, githubLink, liveLink, details, order } = req.body;

  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  const project = new Project({
    title,
    description,
    technologies: parseTechnologies(technologies),
    githubLink,
    liveLink,
    details,
    order: order ?? 0,
  });

  if (req.file) {
    project.imageData = { data: req.file.buffer, contentType: req.file.mimetype };
  }

  await project.save();
  refreshMiddlewareCache();
  res.status(201).json(withAbsoluteImageUrl(req, project.toJSON()));
}

export async function updateProject(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const { title, description, technologies, githubLink, liveLink, details, order } = req.body;

  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (technologies !== undefined) project.technologies = parseTechnologies(technologies);
  if (githubLink !== undefined) project.githubLink = githubLink;
  if (liveLink !== undefined) project.liveLink = liveLink;
  if (details !== undefined) project.details = details;
  if (order !== undefined) project.order = order;

  if (req.file) {
    project.imageData = { data: req.file.buffer, contentType: req.file.mimetype };
  }

  await project.save();
  refreshMiddlewareCache();
  res.json(withAbsoluteImageUrl(req, project.toJSON()));
}

export async function deleteProject(req, res) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  refreshMiddlewareCache();
  res.json({ message: 'Project deleted.' });
}

function parseTechnologies(technologies) {
  if (Array.isArray(technologies)) return technologies;
  if (typeof technologies === 'string') {
    try {
      const parsed = JSON.parse(technologies);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return technologies.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}
