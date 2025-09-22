import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '../middleware/auth.js'
import onlyBakers from '../middleware/onlyBakers.js' // Import the new middleware
import Notification from '../models/Notification.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

const router = express.Router()

// Create a standard order
router.post('/', auth, async (req, res) => {
	try {
		const { items, deliveryInfo, deliveryMethod, paymentMethod, baker } =
			req.body

		if (!items || items.length === 0) {
			return res.status(400).json({ message: 'Cart is empty' })
		}

		if (!baker) {
			return res.status(400).json({ message: 'Baker ID is required' })
		}

		// Ensure the provided baker exists and has baker role
		console.log(
			'🔍 Creating order for baker ID:',
			baker,
			'by user:',
			req.user.id
		)
		const bakerUser = await User.findById(baker).select('role')
		if (!bakerUser || bakerUser.role !== 'admin') {
			console.log('❌ Invalid baker ID:', baker, 'Role:', bakerUser?.role)
			return res.status(400).json({
				message: 'Invalid baker ID. Order must be assigned to a baker.',
			})
		}
		console.log('✅ Valid baker found:', bakerUser.role)

		let totalPrice = 0
		const orderItems = []

		for (const item of items) {
			let itemPrice = 0
			let productData = null

			if (item.product) {
				// Regular product
				productData = await Product.findById(item.product)
				if (!productData) {
					throw new Error(`Product not found for ID: ${item.product}`)
				}
				itemPrice = productData.price
				orderItems.push({ product: item.product, quantity: item.quantity })
			} else if (item.name && item.price) {
				// Custom cake
				itemPrice = item.price
				orderItems.push({
					name: item.name,
					price: item.price,
					quantity: item.quantity,
					selectedSize: item.selectedSize,
					customizedIngredients: item.customizedIngredients,
				})
			} else {
				throw new Error(
					'Invalid item in cart: missing product ID or custom cake details'
				)
			}

			totalPrice += itemPrice * item.quantity
		}

		const orderPayload = {
			user: req.user.id,
			items: orderItems,
			totalPrice,
			deliveryMethod: deliveryMethod || 'delivery',
			paymentMethod: paymentMethod || 'cash',
			orderNumber: uuidv4(),
			baker, // Add baker to the order payload
		}

		if ((deliveryMethod || 'delivery') === 'delivery') {
			orderPayload.deliveryInfo = deliveryInfo
		}

		const order = await Order.create(orderPayload)

		// Notify the user about their order
		await Notification.create({
			userId: req.user.id,
			message: `Ваш заказ #${order.orderNumber} успешно оформлен!`,
			type: 'order_placed',
			orderId: order._id,
		})

		// Notify the baker about a new order
		await Notification.create({
			userId: baker, // The baker's ID
			message: `У вас новый заказ #${order.orderNumber} от ${
				req.user.name || 'клиента'
			}!`,
			type: 'order_placed',
			orderId: order._id,
		})

		res.status(201).json(order)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Create a custom order
router.post('/custom', auth, async (req, res) => {
	try {
		const { details, deliveryInfo, deliveryMethod, paymentMethod, baker } =
			req.body

		if (!details || !deliveryInfo) {
			return res.status(400).json({ message: 'Incomplete custom order data' })
		}

		if (!baker) {
			return res.status(400).json({ message: 'Baker ID is required' })
		}

		const order = await Order.create({
			orderType: 'custom',
			user: req.user.id,
			details,
			totalPrice: 50, // Placeholder price
			deliveryInfo,
			deliveryMethod: deliveryMethod || 'delivery',
			paymentMethod: paymentMethod || 'cash',
			orderNumber: uuidv4(),
			baker, // Add baker to the order payload
		})

		// Notify the user about their custom order
		await Notification.create({
			userId: req.user.id,
			message: `Ваш индивидуальный заказ #${order.orderNumber} успешно оформлен!`,
			type: 'order_placed',
			orderId: order._id,
		})

		// Notify the baker about a new custom order
		await Notification.create({
			userId: baker, // The baker's ID
			message: `У вас новый индивидуальный заказ #${order.orderNumber} от ${req.user.name}!`, // Assuming req.user.name is available
			type: 'order_placed',
			orderId: order._id,
		})

		res.status(201).json(order)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Get user's own orders (only accepted/processed orders)
router.get('/my-orders', auth, async (req, res) => {
	try {
		const orders = await Order.find({
			user: req.user.id,
			status: { $ne: 'pending' }, // Exclude pending orders
		}).populate('items.product')
		res.json(orders)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Get all orders for an admin/baker
router.get('/baker-orders', auth, onlyBakers, async (req, res) => {
	try {
		console.log('🔍 Fetching all orders for baker ID:', req.user.id)
		const orders = await Order.find({ baker: req.user.id })
			.populate('items.product')
			.populate('user', 'name email phone')
			.lean() // Use lean() for better performance

		console.log(
			'📦 Raw orders found:',
			orders.length,
			'for baker:',
			req.user.id
		)

		// Filter out orders with null/undefined users or malformed items.
		// Allow both regular products and valid custom cakes (with name & numeric price).
		const validOrders = orders.filter(order => {
			if (!order.user || !order.items) return false
			return order.items.every(
				item => item.product || (item.name && typeof item.price === 'number')
			)
		})

		console.log('✅ Valid orders after filtering:', validOrders.length)
		res.json(validOrders)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Get new orders for a baker
router.get('/baker/new', auth, onlyBakers, async (req, res) => {
	try {
		console.log('🔍 Fetching new orders for baker ID:', req.user.id)
		const orders = await Order.find({ baker: req.user.id, status: 'pending' })
			.populate('items.product')
			.populate('user', 'name email phone')
			.lean()
		console.log('📦 Found orders:', orders.length, 'for baker:', req.user.id)
		res.json(orders)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Get completed orders for a baker
router.get('/baker/completed', auth, onlyBakers, async (req, res) => {
	try {
		const orders = await Order.find({
			baker: req.user.id,
			status: { $in: ['delivered', 'declined'] },
		})
			.populate('items.product')
			.populate('user', 'name email phone')
			.lean()
		res.json(orders)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Update order status
router.put('/:orderId/status', auth, onlyBakers, async (req, res) => {
	try {
		const { status, reason } = req.body
		const { orderId } = req.params

		const order = await Order.findById(orderId).populate(
			'user',
			'name email phone'
		)
		if (!order) return res.status(404).json({ message: 'Order not found' })

		// Ensure the order belongs to the authenticated baker
		if (order.baker.toString() !== req.user.id) {
			return res.status(403).json({
				message: 'Access denied. You are not authorized to update this order.',
			})
		}

		order.status = status
		if (status === 'declined') {
			order.rejectionReason = reason
		}

		await order.save()

		// Send notification to customer
		if (order.user) {
			let notificationMessage = ''
			let notificationType = ''

			if (status === 'accepted') {
				notificationMessage = `Ваш заказ #${order.orderNumber} принят! Мы свяжемся с вами для подтверждения деталей.`
				notificationType = 'order_accepted'
			} else if (status === 'declined') {
				notificationMessage = `К сожалению, ваш заказ #${
					order.orderNumber
				} отклонен.${reason ? ` Причина: ${reason}` : ''}`
				notificationType = 'order_rejected'
			} else if (status === 'preparing') {
				notificationMessage = `Ваш заказ #${order.orderNumber} готовится! Мы уже начали работу над ним.`
				notificationType = 'order_preparing'
			} else if (status === 'delivered') {
				notificationMessage = `Ваш заказ #${order.orderNumber} выполнен и готов к выдаче/доставке!`
				notificationType = 'order_completed'
			} else if (status === 'shipped') {
				notificationMessage = `Ваш заказ #${order.orderNumber} отправлен! Ожидайте доставку.`
				notificationType = 'order_shipped'
			}

			if (notificationMessage && notificationType) {
				await Notification.create({
					userId: order.user._id,
					message: notificationMessage,
					type: notificationType,
					orderId: order._id,
				})
			}
		}

		res.json(order)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Get order by ID
router.get('/:orderId', auth, async (req, res) => {
	try {
		const order = await Order.findById(req.params.orderId)
			.populate('items.product') // Populate product details
			.populate('user', 'name email') // Populate user details
			.populate('baker', 'name bakeryName') // Populate baker details

		if (!order) {
			return res.status(404).json({ message: 'Order not found' })
		}

		// Ensure the user requesting the order is either the order's user or the baker
		const orderUserId = order.user?._id
			? order.user._id.toString()
			: order.user.toString()
		const orderBakerId = order.baker?._id
			? order.baker._id.toString()
			: order.baker.toString()
		if (orderUserId !== req.user.id && orderBakerId !== req.user.id) {
			return res.status(403).json({ message: 'Access denied' })
		}

		res.json(order)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

// Delete an order
router.delete('/:orderId', auth, onlyBakers, async (req, res) => {
	try {
		const { orderId } = req.params

		const order = await Order.findByIdAndDelete(orderId)

		if (!order) {
			return res.status(404).json({ message: 'Order not found' })
		}

		res.json({ message: 'Order deleted successfully' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: err.message })
	}
})

export default router
