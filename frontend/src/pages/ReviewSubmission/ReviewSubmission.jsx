import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserStore } from '../../store/User'
import './ReviewSubmission.scss'

const ReviewSubmission = () => {
	const { orderId } = useParams()
	const navigate = useNavigate()
	const { token } = useUserStore()

	const [order, setOrder] = useState(null)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		const fetchOrderDetails = async () => {
			if (!token) {
				navigate('/login') // Redirect to login if no token
				return
			}
			try {
				const res = await axios.get(`/api/orders/${orderId}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				setOrder(res.data)
				// Assuming the user reviews one product per order for simplicity,
				// or we can extend this to allow reviewing multiple products.
				// For now, let's pick the first product in the order.
				if (res.data.items && res.data.items.length > 0) {
					setSelectedProduct(res.data.items[0].product)
				}
			} catch (err) {
				console.error('Error fetching order details:', err)
				setError('Failed to load order details.')
			}
		}
		fetchOrderDetails()
	}, [orderId, token, navigate])

	// Prompt user to choose stars (1-5)
	const askForRating = () => {
		const input = window.prompt(
			'Сколько звезд хотите поставить? (1-5)',
			rating > 0 ? String(rating) : '5'
		)
		if (input == null) return
		const num = Number(input)
		if (Number.isFinite(num)) {
			const clamped = Math.min(5, Math.max(1, Math.round(num)))
			setRating(clamped)
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')
		setSuccess('')

		if (!selectedProduct) {
			setError(
				'Please select a product, provide a rating, and write a comment.'
			)
			return
		}
		if (rating === 0) {
			askForRating()
			if (rating === 0) {
				setError('Please set a rating from 1 to 5.')
				return
			}
		}
		if (!comment.trim()) {
			setError(
				'Please select a product, provide a rating, and write a comment.'
			)
			return
		}

		try {
			await axios.post(
				'/api/reviews',
				{
					orderId,
					productId: selectedProduct._id,
					rating,
					comment,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			setSuccess('Review submitted successfully!')
			// Navigate back to My Orders immediately to refresh the list
			setTimeout(() => navigate('/my-orders'), 1500)
		} catch (err) {
			console.error('Error submitting review:', err)
			setError(err.response?.data?.msg || 'Failed to submit review.')
		}
	}

	if (!order) {
		return (
			<div className='review-submission-page'>Loading order details...</div>
		)
	}

	return (
		<div className='review-submission-page'>
			<h1>Оставить отзыв</h1>
			{error && <p className='error-message'>{error}</p>}
			{success && <p className='success-message'>{success}</p>}

			{selectedProduct ? (
				<form onSubmit={handleSubmit} className='review-form'>
					<h2>Отзыв о {selectedProduct.name}</h2>
					<div className='form-group'>
						<label>Рейтинг:</label>
						<div className='star-rating'>
							{[1, 2, 3, 4, 5].map(star => (
								<span
									key={star}
									className={star <= rating ? 'star selected' : 'star'}
									onClick={() => setRating(star)}
								>
									★
								</span>
							))}
						</div>
						<button
							type='button'
							onClick={askForRating}
							style={{ marginTop: 8 }}
						>
							Выбрать кол-во звезд
						</button>
					</div>
					<div className='form-group'>
						<label htmlFor='comment'>Комментарий:</label>
						<textarea
							id='comment'
							value={comment}
							onChange={e => setComment(e.target.value)}
							rows='5'
							placeholder='Напишите ваш отзыв здесь...'
						></textarea>
					</div>
					<button type='submit' className='submit-button'>
						Отправить отзыв
					</button>
				</form>
			) : (
				<p>No product found in this order to review.</p>
			)}
		</div>
	)
}

export default ReviewSubmission
