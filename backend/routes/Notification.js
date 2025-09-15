import express from 'express';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for the authenticated user
router.get('/me', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Mark a notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or not authorized' });
    }

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read for the authenticated user
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
