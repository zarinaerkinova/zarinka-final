import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/User'
import { useOrderStore } from '../../store/Order'
import { FaStar } from "react-icons/fa6";
import toast from 'react-hot-toast'
import './MyOrders.scss'

const MyOrders = () => {
	const navigate = useNavigate()
	const { token } = useUserStore()
	const { deleteUserOrder } = useOrderStore()
	const [orders, setOrders] = useState([])
	const [reviews, setReviews] = useState({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchOrdersAndReviews = async () => {
			try {
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
			} catch (error) {
				console.error("Error fetching orders:", error);
			} finally {
				setLoading(false)
			}
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

	const handleDeleteOrder = async (orderId) => {
		if (!window.confirm('Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.')) {
			return;
		}

		try {
			await deleteUserOrder(token, orderId);
			
			// Удаляем заказ из локального состояния
			setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
			// Также удаляем связанные отзывы
			setReviews(prevReviews => {
				const newReviews = { ...prevReviews };
				delete newReviews[orderId];
				return newReviews;
			});
			
			toast.success('Заказ успешно удален');
		} catch (error) {
			console.error('Error deleting order:', error);
			toast.error('Ошибка при удалении заказа');
		}
	}

	return (
		<div className='orders-container'>
			{loading && <div className='loading-indicator'></div>}
			<h1>Мои заказы</h1>
			{loading ? (
				<p>Загрузка...</p>
			) : orders.length === 0 ? (
				<div className='no-orders-message'>
					<p>У вас пока нет заказов.</p>
					<span>Здесь будут отображаться ваши заказы.</span>
				</div>
			) : (
				orders.map(order => (
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

						{/* Delete Order Button */}
						<div className='order-actions'>
							<button
								onClick={() => handleDeleteOrder(order._id)}
								className='delete-button'
							>
								🗑️ Удалить заказ
							</button>
						</div>
					</div>
				))
			)}
		</div>
	)
}

export default MyOrders