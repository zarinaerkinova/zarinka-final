import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const auth = async (req, res, next) => {
	const authHeader = req.headers.authorization

	// No Authorization header
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			success: false,
			message: 'You are not logged in. Please log in to continue.',
		})
	}

	const token = authHeader.split(' ')[1]

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// Check if user still exists
		const user = await User.findById(decoded.userId).select('-password')
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Your account no longer exists. Please sign up again.',
			})
		}

		req.user = user
		console.log('🔐 Authenticated user:', user._id, 'Role:', user.role)
		next()
	} catch (err) {
		// Differentiate token errors
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: 'Your session has expired. Please log in again.',
			})
		}

		return res.status(401).json({
			success: false,
			message: 'Invalid authentication token. Please log in again.',
		})
	}
}
