import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import {
	baker,
	bakers,
	changePassword,
	deleteAccount,
	getBakerById,
	login,
	register,
	updateProfile,
	user,
} from '../controllers/auth.js'
import { auth } from '../middleware/auth.js'
// import { upload } from '../middleware/upload.js';
import multer from 'multer'

dotenv.config()

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname)
		const sanitizedFilename = file.originalname
			.normalize('NFD')
			.replace(/[^\w.]/g, '') // Remove non-ASCII characters
		cb(null, Date.now() + '-' + sanitizedFilename)
	},
})

const upload = multer({ storage })

const router = express.Router()

router.post('/login', login)
router.post('/register', upload.single('image'), register)
router.get('/profile', auth, user)
router.put(
	'/profile',
	auth,
	upload.fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'galleryImages', maxCount: 10 },
	]),
	updateProfile
)
router.put('/change-password', auth, changePassword)
router.delete('/profile', auth, deleteAccount)
router.get('/bakers', bakers)
router.get('/bakers/:id', getBakerById)
router.get('/:bakerId/products', baker)

export default router
