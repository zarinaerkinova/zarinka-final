import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import {
	createProduct,
	deleteProduct,
	getBakerProducts,
	getProductById,
	getProducts,
	getProductsByCategory,
	updateProduct,
} from '../controllers/Product.js'
import { auth } from '../middleware/auth.js'
import onlyBakers from '../middleware/onlyBakers.js' // Changed from onlyAdmins

const router = express.Router()

// Use the same uploads path as in index.js
const uploadDir = path.join(process.cwd(), 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
	console.log('📁 Created uploads directory:', uploadDir)
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir) // absolute path to uploads folder
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname)
	},
})

const upload = multer({
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		// Accept only image files
		if (file.mimetype.startsWith('image/')) {
			cb(null, true)
		} else {
			cb(new Error('Only image files are allowed'), false)
		}
	},
})

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({
				success: false,
				message: 'File too large. Maximum size is 10MB.',
			})
		}
		return res.status(400).json({
			success: false,
			message: err.message,
		})
	}
	if (err) {
		return res.status(400).json({
			success: false,
			message: err.message,
		})
	}
	next()
}

router.get('/', getProducts)
// Place more specific routes BEFORE the generic "/:id" route
router.get('/category/:categoryId', getProductsByCategory)
router.get('/bakers/:bakerId', getBakerProducts)
router.get('/:id', getProductById)

router.post(
	'/',
	auth,
	onlyBakers, // Changed from onlyAdmins
	upload.single('image'),
	handleMulterError,
	(req, res, next) => {
		if (!req.file) {
			return res
				.status(400)
				.json({ success: false, message: 'Product image is required' })
		}
		next()
	},
	createProduct
)

router.put('/:id', auth, onlyBakers, upload.single('image'), updateProduct)
router.delete('/:id', auth, onlyBakers, deleteProduct)

export default router
