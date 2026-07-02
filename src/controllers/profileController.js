import Profile from '../models/Profile.js';
import { refreshMiddlewareCache } from '../services/notifyMiddleware.js';

function withAbsoluteImageUrl(req, profileJson) {
  if (profileJson.profileImage) {
    profileJson.profileImage = `${req.protocol}://${req.get('host')}${profileJson.profileImage}`;
  }
  return profileJson;
}

export async function getProfile(req, res) {
  const profile = await Profile.findOne().sort({ createdAt: 1 });
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found. Seed the database first.' });
  }
  res.json(withAbsoluteImageUrl(req, profile.toJSON()));
}

export async function getProfileImage(req, res) {
  const profile = await Profile.findOne().sort({ createdAt: 1 });
  if (!profile?.profileImageData?.data) {
    return res.status(404).end();
  }
  res.set('Content-Type', profile.profileImageData.contentType);
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(profile.profileImageData.data);
}

// Admin-only: update profile fields and optionally replace the image.
export async function updateProfile(req, res) {
  let profile = await Profile.findOne().sort({ createdAt: 1 });
  if (!profile) profile = new Profile({});

  const { name, role, description, professionalSummary, currentCompany, location, resumeLink } =
    req.body;

  if (name !== undefined) profile.name = name;
  if (role !== undefined) profile.role = role;
  if (description !== undefined) profile.description = description;
  if (professionalSummary !== undefined) profile.professionalSummary = professionalSummary;
  if (currentCompany !== undefined) profile.currentCompany = currentCompany;
  if (location !== undefined) profile.location = location;
  if (resumeLink !== undefined) profile.resumeLink = resumeLink;

  if (req.body.socialLinks) {
    const parsed =
      typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;
    profile.socialLinks = parsed;
  }

  if (req.file) {
    profile.profileImageData = { data: req.file.buffer, contentType: req.file.mimetype };
  }

  await profile.save();
  refreshMiddlewareCache();
  res.json(withAbsoluteImageUrl(req, profile.toJSON()));
}
