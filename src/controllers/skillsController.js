import Skill from '../models/Skill.js';
import { refreshMiddlewareCache } from '../services/notifyMiddleware.js';

export async function getSkills(req, res) {
  const skills = await Skill.find().sort({ order: 1 });
  res.json(skills);
}

// --- Admin-only ---

export async function createSkillCategory(req, res) {
  const { category, items, order } = req.body;
  if (!category?.trim()) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  const skill = await Skill.create({
    category,
    items: parseItems(items),
    order: order ?? 0,
  });

  refreshMiddlewareCache();
  res.status(201).json(skill);
}

export async function updateSkillCategory(req, res) {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill category not found' });

  const { category, items, order } = req.body;
  if (category !== undefined) skill.category = category;
  if (items !== undefined) skill.items = parseItems(items);
  if (order !== undefined) skill.order = order;

  await skill.save();
  refreshMiddlewareCache();
  res.json(skill);
}

export async function deleteSkillCategory(req, res) {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill category not found' });
  refreshMiddlewareCache();
  res.json({ message: 'Skill category deleted.' });
}

function parseItems(items) {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}
