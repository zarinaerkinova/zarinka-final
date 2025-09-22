import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserStore } from '../../store/User'
import { useLoadingStore } from '../../store/Loading'
import './ReviewSubmission.scss'

const ReviewSubmission = () => {
	const { orderId } = useParams()
	const navigate = useNavigate()
	const { token } = useUserStore()
	const { setLoading } = useLoadingStore()

	const [order, setOrder] = useState(null)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		const fetchOrderDetails = async () => {
			setLoading(true)
			if (!token) {
				navigate('/login')
				setLoading(false)
				return
			}
			try {
				const res = await axios.get(`/api/orders/${orderId}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				setOrder(res.data)
				if (res.data.items && res.data.items.length > 0) {
					setSelectedProduct(res.data.items[0].product)
				}
			} catch (err) {
				console.error('Error fetching order details:', err)
				setError('Failed to load order details.')
			} finally {
				setLoading(false)
			}
		}
		fetchOrderDetails()
	}, [orderId, token, navigate, setLoading])

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
			setTimeout(() => navigate('/my-orders'), 1500)
		} catch (err) {
			console.error('Error submitting review:', err)
			setError(err.response?.data?.msg || 'Failed to submit review.')
		}
	}

	return (
		<div className='review-submission-page'>
			<h1>Оставить отзыв</h1>
			
			{error && <div className='error-message'>{error}</div>}
			{success && <div className='success-message'>{success}</div>}

			{selectedProduct ? (
				<form onSubmit={handleSubmit} className='review-form'>
					<h2>Отзыв о {selectedProduct.name}</h2>
					
					<div className='form-group'>
						<label htmlFor="rating">Рейтинг:</label>
						<div className='star-rating'>
							{[1, 2, 3, 4, 5].map(star => (
								<span
									key={star}
									className={star <= rating ? 'star selected' : 'star'}
									onClick={() => setRating(star)}
									role="button"
									tabIndex={0}
									onKeyPress={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											setRating(star)
										}
									}}
								>
									★
								</span>
							))}
						</div>

					</div>
					
					<div className='form-group'>
						<label htmlFor='comment'>Комментарий:</label>
						<textarea
							id='comment'
							value={comment}
							onChange={e => setComment(e.target.value)}
							rows='5'
							placeholder='Напишите ваш отзыв здесь... Расскажите о качестве блюда, сервисе и общих впечатлениях.'
						></textarea>
					</div>
					
					<button 
						type='submit' 
						className='submit-button'
						disabled={rating === 0 || !comment.trim()}
					>
						Отправить отзыв
					</button>
				</form>
			) : (
				<div className='no-product-message'>
					<p>No product found in this order to review.</p>
				</div>
			)}
		</div>
	)
}

export default ReviewSubmission