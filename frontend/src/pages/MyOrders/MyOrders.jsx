import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/User'
import { FaStar } from "react-icons/fa6";
import './MyOrders.scss'

const MyOrders = () => {
	const navigate = useNavigate()
	const { token } = useUserStore()
	const [orders, setOrders] = useState([])
	const [reviews, setReviews] = useState({})

	useEffect(() => {
		const fetchOrdersAndReviews = async () => {
			const res = await axios.get('/api/orders/my-orders', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setOrders(res.data)

			const reviewsData = {}
			for (const order of res.data) {
				if (order.status === 'delivered') {
					try {
						const reviewRes = await axios.get(
							`/api/reviews/order/${order._id}`,
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
						if (reviewRes.data.review) {
							reviewsData[order._id] = reviewRes.data.review
						}
					} catch (err) {
						console.log('No review found for order:', order._id)
					}
				}
			}
			setReviews(reviewsData)
		}
		if (token) {
			fetchOrdersAndReviews()
		}
	}, [token])

	const getStatusLabel = status => {
		switch (status) {
			case 'pending':
				return 'Ожидает'
			case 'accepted':
				return 'Принят'
			case 'confirmed':
				return 'Готовка'
			case 'shipped':
				return 'Доставка'
			case 'delivered':
				return 'Доставлен'
			case 'declined':
				return 'Отклонен'
			default:
				return status
		}
	}

	const getStatusClass = status => {
		return `status-badge status-${status}`
	}

	const getProgress = status => {
		switch (status) {
			case 'accepted':
				return 25
			case 'confirmed':
				return 50
			case 'shipped':
				return 75
			case 'delivered':
				return 100
			default:
				return 0
		}
	}

	return (
		<div className='orders-container'>
			<h1>Мои заказы</h1>
			{orders.map(order => (
				<div key={order._id} className='order-card'>
					<h3>Заказ #{order._id}</h3>
					
					<div className='status-section'>
						<p>
							Статус:{' '}
							<span className={getStatusClass(order.status)}>
								{getStatusLabel(order.status)}
							</span>
						</p>
					</div>

					<div className='progress-container'>
						<div className='progress-bar'>
							<div
								className='progress-fill'
								style={{ width: `${getProgress(order.status)}%` }}
							/>
						</div>
					</div>

					<div className='order-items'>
						<ul>
							{(order.items || []).map((item, idx) => (
								<li
									key={`${order._id}-item-${idx}-${
										item.product?._id || item.name || 'custom'
									}`}
								>
									{item.product?.name || item.name} × {item.quantity}
								</li>
							))}
						</ul>
					</div>
					
					<p className='total-price'>Итого: {order.totalPrice} ₽</p>
					
					{order.status === 'delivered' && !reviews[order._id] && (
						<button
							onClick={() => navigate(`/review/${order._id}`)}
							className='review-button'
						>
							Оставить отзыв
						</button>
					)}
					
					{order.status === 'delivered' && reviews[order._id] && (
						<div className='review-display'>
							<h4>Ваш отзыв</h4>
							<div className='stars-container'>
								{[...Array(5)].map((_, i) => (
									<FaStar 
										key={i} 
										className={`star ${i < reviews[order._id].rating ? 'filled' : 'empty'}`}
									/>
								))}
							</div>
							<p className='review-comment'>{reviews[order._id].comment}</p>
						</div>
					)}
				</div>
			))}
		</div>
	)
}

export default MyOrders