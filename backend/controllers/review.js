import Order from '../models/Order.js' // To verify order status and get baker ID
import Product from '../models/Product.js'
import Review from '../models/Review.js'
import User from '../models/User.js'

export const createReview = async (req, res) => {
	const { orderId, productId, rating, comment } = req.body
	const userId = req.user.id // User ID from auth middleware

	try {
		// 1. Verify the order exists and is delivered
		const order = await Order.findById(orderId)
		if (!order) {
			return res.status(404).json({ msg: 'Order not found' })
		}
		if (order.status !== 'delivered') {
			return res.status(400).json({ msg: 'Cannot review an undelivered order' })
		}

		// Ensure the product being reviewed is part of this order
		const productExistsInOrder = order.items.some(
			item => item.product.toString() === productId
		)
		if (!productExistsInOrder) {
			return res.status(404).json({ msg: 'Product not found in this order' })
		}
		const bakerId = order.baker // Get baker ID directly from the order

		// 3. Check if a review already exists for this order, product, and user
		const existingReview = await Review.findOne({
			order: orderId,
			product: productId,
			user: userId,
		})
		if (existingReview) {
			return res
				.status(400)
				.json({ msg: 'You have already reviewed this product for this order' })
		}

		// 4. Create the new review
		const newReview = new Review({
			product: productId,
			baker: bakerId,
			user: userId,
			rating,
			comment,
			order: orderId,
		})

		const savedReview = await newReview.save()

		// 5. Update the product's average rating
		const product = await Product.findById(productId)
		if (product) {
			const totalRating = product.rating.average * product.rating.count + rating
			const newCount = product.rating.count + 1
			product.rating.average = totalRating / newCount
			product.rating.count = newCount
			await product.save()
		}

		// 6. Update the baker's average rating
		const baker = await User.findById(bakerId)
		if (baker) {
			const reviews = await Review.find({ baker: bakerId })
			baker.numReviews = reviews.length
			baker.rating = 
				reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
			await baker.save()
		}

		res.status(201).json(savedReview)
	} catch (error) {
		console.error('Error creating review:', error)
		res.status(500).json({ msg: 'Server error' })
	}
}

export const checkOrderReviewed = async (req, res) => {
	const { orderId } = req.params
	const userId = req.user.id

	try {
		// Check if any review exists for this order by this user
		const existingReview = await Review.findOne({
			order: orderId,
			user: userId,
		})

		res.json({
			reviewed: !!existingReview,
			review: existingReview,
		})
	} catch (error) {
		console.error('Error checking order review status:', error)
		res.status(500).json({ msg: 'Server error' })
	}
}

export const getBakerReviews = async (req, res) => {
	const bakerId = req.user.id

	try {
		const reviews = await Review.find({ baker: bakerId })
			.populate('user', 'name email')
			.populate('product', 'name')
			.populate('order', 'orderNumber')
			.sort({ createdAt: -1 })

		res.json(reviews)
	} catch (error) {
		console.error('Error fetching baker reviews:', error)
		res.status(500).json({ msg: 'Server error' })
	}
}
