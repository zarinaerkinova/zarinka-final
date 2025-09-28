import express from 'express';
import { auth } from '../middleware/auth.js';
import { getBakerProfile, updateBakerProfile, upload } from '../controllers/bakerProfile.js'; // Import upload

const router = express.Router();

// Get baker's own profile (protected by auth)
router.get('/profile', auth, getBakerProfile);

// Update baker's own profile (protected by auth)
router.put('/profile', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), updateBakerProfile); // Handle multiple file uploads

export default router;
