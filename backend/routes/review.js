import express from 'express'
import {
	checkOrderReviewed,
	createReview,
	getBakerReviews,
} from '../controllers/review.js'
import { auth } from '../middleware/auth.js'
import onlyBakers from '../middleware/onlyBakers.js'

const router = express.Router()

router.post('/', auth, createReview)
router.get('/order/:orderId', auth, checkOrderReviewed)
router.get('/baker', auth, onlyBakers, getBakerReviews)

export default router
