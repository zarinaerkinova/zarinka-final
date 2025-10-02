import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'

// Routes
import authRoutes from './routes/auth.js'
import bakerProfileRoutes from './routes/bakerProfile.js' // Import bakerProfileRoutes
import cartRoutes from './routes/Cart.js'
import categoryRoutes from './routes/Category.js'
import contactRoutes from './routes/contact.js'
import favoriteRoutes from './routes/Favorite.js'
import notificationRoutes from './routes/Notification.js'
import availabilityRoutes from './routes/availability.js'
import orderRoutes from './routes/Order.js'
import productRoutes from './routes/Product.js'
import reviewRoutes from './routes/review.js' // Import reviewRoutes
import uploadRoute from './routes/upload.js'
// server.js or app.js

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
console.log('Serving static files from:', path.join(__dirname, '..', 'uploads'))

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173']
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true)
			if (allowedOrigins.includes(origin)) return callback(null, true)
			return callback(new Error('Not allowed by CORS'))
		},
		credentials: true,
	})
)
app.options('*', cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoute)
app.use('/api/contact', contactRoutes)
app.use('/api/baker', bakerProfileRoutes) // Use bakerProfileRoutes
app.use('/api/reviews', reviewRoutes) // Use reviewRoutes
app.use('/api/notifications', notificationRoutes)
app.use('/api/availability', availabilityRoutes)

// Error handler
app.use((err, req, res, next) => {
	console.error('Unhandled Error:', err)
	res.status(500).json({ success: false, msg: 'Internal server error' })
})

const PORT = process.env.PORT || 5000

// Start server
connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`✅ Server running on http://localhost:${PORT}`)
		})
	})
	.catch(error => {
		console.error('❌ Failed to connect to DB', error)
		process.exit(1)
	})