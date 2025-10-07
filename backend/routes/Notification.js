import express from 'express';
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for a user
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
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Delete a single notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Delete all notifications for a user
router.delete('/', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user.id });
        res.json({ message: 'All notifications deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

export default router;