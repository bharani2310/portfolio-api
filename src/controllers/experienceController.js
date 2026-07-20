import Experience from '../models/Experience.js';
import { refreshMiddlewareCache } from '../services/notifyMiddleware.js';

function withAbsoluteImageUrl(req, experienceJson) {
  if (experienceJson.image) {
    experienceJson.image = `${req.protocol}://${req.get('host')}${experienceJson.image}`;
  }
  return experienceJson;
}

export async function getExperience(req, res) {
  const experience = await Experience.find().sort({ order: 1 });
  res.json(experience.map((e) => withAbsoluteImageUrl(req, e.toJSON())));
}

export async function getExperienceImage(req, res) {
  const experience = await Experience.findById(req.params.id);
  if (!experience?.imageData?.data) return res.status(404).end();
  res.set('Content-Type', experience.imageData.contentType);
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(experience.imageData.data);
}

// --- Admin-only ---

export async function createExperience(req, res) {
  const { companyName, workplaceType, location, roles, technologies, order } = req.body;
  if (!companyName?.trim()) {
    return res.status(400).json({ message: 'Company name is required.' });
  }
  const experience = new Experience({
    companyName,
    workplaceType: workplaceType || null,
    location: location || '',
    roles: parseRoles(roles),
    technologies: parseList(technologies),
    order: order ?? 0,
  });

  if (req.file) {
    experience.imageData = { data: req.file.buffer, contentType: req.file.mimetype };
  }

  await experience.save();
  refreshMiddlewareCache();
  res.status(201).json(withAbsoluteImageUrl(req, experience.toJSON()));
}

export async function updateExperience(req, res) {
  const experience = await Experience.findById(req.params.id);
  if (!experience) return res.status(404).json({ message: 'Experience entry not found' });
  const { companyName, workplaceType, location, roles, technologies, order } = req.body;
  if (companyName !== undefined) experience.companyName = companyName;
  if (workplaceType !== undefined) experience.workplaceType = workplaceType || null;
  if (location !== undefined) experience.location = location;
  if (roles !== undefined) experience.roles = parseRoles(roles);
  if (technologies !== undefined) experience.technologies = parseList(technologies);
  if (order !== undefined) experience.order = order;

  if (req.file) {
    experience.imageData = { data: req.file.buffer, contentType: req.file.mimetype };
  }

  await experience.save();
  refreshMiddlewareCache();
  res.json(withAbsoluteImageUrl(req, experience.toJSON()));
}

export async function deleteExperience(req, res) {
  const experience = await Experience.findByIdAndDelete(req.params.id);
  if (!experience) return res.status(404).json({ message: 'Experience entry not found' });
  refreshMiddlewareCache();
  res.json({ message: 'Experience entry deleted.' });
}

function parseRoles(roles) {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === 'string') {
    try { return JSON.parse(roles); } catch { return []; }
  }
  return [];
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const p = JSON.parse(value);
      if (Array.isArray(p)) return p;
    } catch {
      return value.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
}
