import Contact from '../models/Contact.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createContact(req, res) {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'Name, email and message are all required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const contact = await Contact.create({ name: name.trim(), email: email.trim(), message: message.trim() });
  res.status(201).json({ message: 'Message received successfully.', id: contact._id });
}

// Admin-only: view submitted messages.
export async function getContacts(req, res) {
  const contacts = await Contact.find().sort({ createdDate: -1 });
  res.json(contacts);
}

// Admin-only: delete a single message.
export async function deleteContact(req, res) {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ message: 'Message not found.' });
  res.json({ message: 'Message deleted.' });
}

// Admin-only: delete every message from a given sender (a whole conversation).
export async function deleteConversation(req, res) {
  const email = decodeURIComponent(req.params.email);
  await Contact.deleteMany({ email });
  res.json({ message: 'Conversation deleted.' });
}

// Admin-only: mark every message from a given sender as read.
export async function markConversationRead(req, res) {
  const email = decodeURIComponent(req.params.email);
  await Contact.updateMany({ email, read: false }, { $set: { read: true } });
  res.json({ message: 'Conversation marked as read.' });
}
