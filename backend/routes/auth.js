import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { login, register, user, bakers, baker, getBakerById, updateProfile } from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';
// import { upload } from '../middleware/upload.js'; 
import multer from 'multer';

dotenv.config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/login', login);
router.post('/register', upload.single('image'), register);
router.get('/profile', auth, user);
router.put('/profile', auth, upload.single('image'), updateProfile);
router.get('/bakers', bakers);
router.get('/bakers/:id', getBakerById);
router.get('/:bakerId/products', baker);

export default router;
