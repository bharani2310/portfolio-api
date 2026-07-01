import Experience from '../models/Experience.js';

export async function getExperience(req, res) {
  const experience = await Experience.find().sort({ order: 1 });
  res.json(experience);
}

// --- Admin-only ---

export async function createExperience(req, res) {
  const { companyName, roles, technologies, order } = req.body;
  if (!companyName?.trim()) {
    return res.status(400).json({ message: 'Company name is required.' });
  }
  const experience = await Experience.create({
    companyName,
    roles: parseRoles(roles),
    technologies: parseList(technologies),
    order: order ?? 0,
  });
  res.status(201).json(experience);
}

export async function updateExperience(req, res) {
  const experience = await Experience.findById(req.params.id);
  if (!experience) return res.status(404).json({ message: 'Experience entry not found' });
  const { companyName, roles, technologies, order } = req.body;
  if (companyName !== undefined) experience.companyName = companyName;
  if (roles !== undefined) experience.roles = parseRoles(roles);
  if (technologies !== undefined) experience.technologies = parseList(technologies);
  if (order !== undefined) experience.order = order;
  await experience.save();
  res.json(experience);
}

export async function deleteExperience(req, res) {
  const experience = await Experience.findByIdAndDelete(req.params.id);
  if (!experience) return res.status(404).json({ message: 'Experience entry not found' });
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
