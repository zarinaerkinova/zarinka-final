import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: [
			'order_placed',
			'order_accepted',
			'order_rejected',
			'order_preparing',
			'order_completed',
			'order_shipped',
			'new_review',
			'product_update',
			'baker_update',
		],
		required: true,
	},
	orderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
		required: false, // Not all notifications will be order-related
	},
	read: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

export default mongoose.model('Notification', NotificationSchema)
