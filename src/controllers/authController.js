import Admin from '../models/Admin.js';
import { signToken } from '../utils/jwt.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await admin.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken({ id: admin._id, email: admin.email });
  res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
}

export async function me(req, res) {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found.' });
  res.json(admin);
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  const admin = await Admin.findById(req.admin.id);
  const valid = await admin.comparePassword(currentPassword);
  if (!valid) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }

  admin.passwordHash = await Admin.hashPassword(newPassword);
  await admin.save();
  res.json({ message: 'Password updated successfully.' });
}
