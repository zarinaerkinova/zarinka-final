import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const orderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: false, // Not required for custom cakes
	},
	name: {
		type: String,
		required: function () { return !this.product; }, // Required if no product
	},
	price: {
		type: Number,
		required: function () { return !this.product; }, // Required if no product
	},
	quantity: { type: Number, min: 1, required: true },
	selectedSize: {
		type: {
			label: String,
			price: Number,
		},
		required: false,
	},
	customizedIngredients: {
		type: [
			{
				id: String,
				name: String,
				price: Number,
			},
		],
		default: [],
	},
})

const orderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	baker: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	items: {
		type: [orderItemSchema],
		required: true,
	},
	totalPrice: {
		type: Number,
		required: true,
		min: 0,
	},
	deliveryInfo: {
		name: {
			type: String,
			required: function () {
				return this.deliveryMethod === 'delivery'
			},
		},
		phone: {
			type: String,
			required: function () {
				return this.deliveryMethod === 'delivery'
			},
		},
		streetAddress: {
			type: String,
			required: function () {
				return this.deliveryMethod === 'delivery'
			},
		},
		city: {
			type: String,
			required: function () {
				return this.deliveryMethod === 'delivery'
			},
		},
	},
	deliveryMethod: {
		type: String,
		enum: ['delivery', 'pickup'],
		default: 'delivery',
	},
	paymentMethod: {
		type: String,
		enum: ['cash', 'card', 'online'],
		default: 'cash',
	},
	status: {
		type: String,
		enum: [
			'pending',
			'accepted',
			'preparing',
			'confirmed',
			'shipped',
			'delivered',
			'declined',
		],
		default: 'pending',
	},
	rejectionReason: {
		type: String,
	},
	orderNumber: {
		type: String,
		unique: true,
		default: () => uuidv4(),
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

export default mongoose.model('Order', orderSchema)
