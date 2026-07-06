import sharp from 'sharp';
import Profile from '../models/Profile.js';
import Experience from '../models/Experience.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';

/**
 * Compress a Buffer to a small WebP and return as a data-URI.
 * Targets ~30KB per image — safe for localStorage across all browsers.
 */
async function toDataUri(buffer, contentType) {
  if (!buffer) return null;
  try {
    const compressed = await sharp(buffer)
      .resize({ width: 720, withoutEnlargement: true }) //400
      .webp({ quality: 75 }) //55
      .toBuffer();
    return `data:image/webp;base64,${compressed.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function getAllData(req, res) {
  const [profile, experience, skills, projects] = await Promise.all([
    Profile.findOne().sort({ createdAt: 1 }).lean(),
    Experience.find().sort({ order: 1, startDate: 1 }).lean(),
    Skill.find().sort({ order: 1 }).lean(),
    Project.find().sort({ order: 1, createdAt: -1 }).lean(),
  ]);

  // Compress profile image
  let profileImageDataUri = null;
  if (profile?.profileImageData?.data) {
    profileImageDataUri = await toDataUri(
      profile.profileImageData.data.buffer ?? profile.profileImageData.data,
      profile.profileImageData.contentType
    );
  }

  // Compress project images (kept smaller for card thumbnails)
  const projectsWithImages = await Promise.all(
    (projects || []).map(async (p) => {
      let imageDataUri = null;
      if (p.imageData?.data) {
        try {
          const buf = p.imageData.data.buffer ?? p.imageData.data;
          const compressed = await sharp(buf)
            .resize({ width: 600, withoutEnlargement: true })
            .webp({ quality: 50 })
            .toBuffer();
          imageDataUri = `data:image/webp;base64,${compressed.toString('base64')}`;
        } catch { /* skip */ }
      }
      const { imageData, __v, ...rest } = p;
      return { ...rest, image: imageDataUri };
    })
  );

  // Strip binary fields from profile; add the compressed data-URI.
  // resumeFileData is stripped the same way profileImageData is — it's
  // never meant to leave the database as raw bytes. Unlike profileImage,
  // we don't need a data-URI here: the public site fetches the actual
  // PDF from the middleware's own /api/resume route (see Hero.jsx), so
  // this only needs to be a truthy "yes, a resume exists" signal.
  const { profileImageData, resumeFileData, __v, ...profileRest } = profile || {};

  // Flatten socialLinks Map if it serialised oddly from .lean()
  let socialLinks = profileRest.socialLinks;
  if (socialLinks instanceof Map) {
    socialLinks = Object.fromEntries(socialLinks);
  }

  res.json({
    profile: {
      ...profileRest,
      profileImage: profileImageDataUri,
      resumeFile: Boolean(resumeFileData?.contentType),
      socialLinks: socialLinks || {},
    },
    experience: experience || [],
    skills: skills || [],
    projects: projectsWithImages,
    generatedAt: new Date().toISOString(),
  });
}