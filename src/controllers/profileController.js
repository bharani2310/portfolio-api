import Profile from '../models/Profile.js';
import { refreshMiddlewareCache, refreshMiddlewareResumeCache } from '../services/notifyMiddleware.js';

// Appends ?v=<updatedAt timestamp> to file URLs so the browser is forced
// to fetch fresh bytes every time the underlying file actually changes,
// instead of reusing whatever it already cached for that URL (which
// never changes as a string, even though the file behind it does).
function withAbsoluteFileUrls(req, profileJson) {
  const base = `${req.protocol}://${req.get('host')}`;
  const version = profileJson.updatedAt ? `?v=${new Date(profileJson.updatedAt).getTime()}` : '';
  if (profileJson.profileImage) profileJson.profileImage = `${base}${profileJson.profileImage}${version}`;
  if (profileJson.resumeFile) profileJson.resumeFile = `${base}${profileJson.resumeFile}${version}`;
  return profileJson;
}

export async function getProfile(req, res) {
  const profile = await Profile.findOne().sort({ createdAt: 1 });
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found. Seed the database first.' });
  }
  res.json(withAbsoluteFileUrls(req, profile.toJSON()));
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

// Serves the uploaded resume PDF. Shown inline by default (so it renders
// in the browser's own PDF viewer); pass ?download=1 to force a
// "Save As" download instead. This route is what the middleware's own
// GET /api/resume proxies to when its cache is cold.
export async function getProfileResume(req, res) {
  const profile = await Profile.findOne().sort({ createdAt: 1 });
  if (!profile?.resumeFileData?.data) {
    return res.status(404).json({ message: 'No resume has been uploaded yet.' });
  }
  const disposition = req.query.download ? 'attachment' : 'inline';
  res.set('Content-Type', profile.resumeFileData.contentType);
  res.set('Content-Disposition', `${disposition}; filename="resume.pdf"`);
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(profile.resumeFileData.data);
}

// Admin-only: update profile fields and optionally replace the image and/or resume.
export async function updateProfile(req, res) {
  let profile = await Profile.findOne().sort({ createdAt: 1 });
  if (!profile) profile = new Profile({});

  const { name, role, description, professionalSummary, currentCompany, location } = req.body;

  if (name !== undefined) profile.name = name;
  if (role !== undefined) profile.role = role;
  if (description !== undefined) profile.description = description;
  if (professionalSummary !== undefined) profile.professionalSummary = professionalSummary;
  if (currentCompany !== undefined) profile.currentCompany = currentCompany;
  if (location !== undefined) profile.location = location;

  if (req.body.socialLinks) {
    const parsed =
      typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;
    profile.socialLinks = parsed;
  }

  // req.files (not req.file) because uploadProfileFiles uses .fields(),
  // so both an image and a resume can arrive in the same request.
  const imageFile = req.files?.image?.[0];
  const resumeFile = req.files?.resume?.[0];

  if (imageFile) {
    profile.profileImageData = { data: imageFile.buffer, contentType: imageFile.mimetype };
  }
  if (resumeFile) {
    profile.resumeFileData = { data: resumeFile.buffer, contentType: resumeFile.mimetype };
  }

  await profile.save();

  // Keeps the main /api/all cache fresh regardless of what changed.
  refreshMiddlewareCache();
  // Only pokes the SEPARATE resume cache when the resume itself actually
  // changed — no need to re-fetch a multi-MB PDF into KV over a name edit.
  if (resumeFile) {
    refreshMiddlewareResumeCache();
  }

  res.json(withAbsoluteFileUrls(req, profile.toJSON()));
}
