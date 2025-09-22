import express from 'express';
import { auth } from '../middleware/auth.js';
import onlyAdmins from '../middleware/onlyAdmins.js'; // Assuming bakers are managed by admins or have a specific role check
import { getBakerProfile, updateBakerProfile, upload } from '../controllers/bakerProfile.js'; // Import upload

const router = express.Router();

// Get baker's own profile (protected by auth and baker/admin role)
router.get('/profile', auth, onlyAdmins, getBakerProfile);

// Update baker's own profile (protected by auth and baker/admin role)
router.put('/profile', auth, onlyAdmins, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), updateBakerProfile); // Handle multiple file uploads

export default router;
