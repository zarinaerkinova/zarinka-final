import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/User'

const MyOrders = () => {
	const navigate = useNavigate() // Initialize useNavigate hook
	const { token } = useUserStore()
	const [orders, setOrders] = useState([])
	const [reviewedOrders, setReviewedOrders] = useState(new Set())

	useEffect(() => {
		const fetchOrders = async () => {
			const res = await axios.get('/api/orders/my-orders', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setOrders(res.data)

			// Check which orders have been reviewed
			const reviewedOrderIds = []
			for (const order of res.data) {
				if (order.status === 'delivered') {
					try {
						const reviewRes = await axios.get(
							`/api/reviews/order/${order._id}`,
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
						if (reviewRes.data.reviewed) {
							reviewedOrderIds.push(order._id)
						}
					} catch (err) {
						console.log('No review found for order:', order._id)
					}
				}
			}
			setReviewedOrders(new Set(reviewedOrderIds))
		}
		fetchOrders()
	}, [token])

	// Check if order has been reviewed
	const isOrderReviewed = orderId => {
		return reviewedOrders.has(orderId)
	}

	// Mark order as reviewed
	const markOrderAsReviewed = orderId => {
		setReviewedOrders(prev => new Set([...prev, orderId]))
	}

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
		<div
			className='orders-container'
			style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}
		>
			<h1>Мои заказы</h1>
			{orders
				.filter(order => !isOrderReviewed(order._id))
				.map(order => (
					<div
						key={order._id}
						className='order-card'
						style={{
							background: '#fff',
							borderRadius: 12,
							padding: '1rem 1.25rem',
							boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
							marginBottom: '1rem',
						}}
					>
						<h3 style={{ marginTop: 0, marginBottom: 8 }}>
							Заказ #{order._id}
						</h3>
						<p style={{ margin: '4px 0' }}>
							Статус:{' '}
							<span
								style={{
									display: 'inline-block',
									padding: '2px 8px',
									borderRadius: 12,
									fontSize: 12,
									background:
										order.status === 'declined'
											? '#dc3545'
											: order.status === 'delivered'
											? '#28a745'
											: order.status === 'shipped'
											? '#17a2b8'
											: order.status === 'confirmed'
											? '#ffc107'
											: order.status === 'accepted'
											? '#0dcaf0'
											: '#e0e0e0',
									color: order.status === 'confirmed' ? '#000' : '#fff',
								}}
							>
								{getStatusLabel(order.status)}
							</span>
						</p>

						<div
							style={{
								height: 8,
								background: '#eee',
								borderRadius: 8,
								overflow: 'hidden',
								margin: '8px 0 12px',
							}}
						>
							<div
								style={{
									width: `${getProgress(order.status)}%`,
									height: '100%',
									background: '#28a745',
									transition: 'width 0.3s ease',
								}}
							/>
						</div>

						<ul style={{ paddingLeft: 18, margin: '8px 0 12px' }}>
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
						<p style={{ margin: 0 }}>Итого: {order.totalPrice} ₽</p>
						{order.status === 'delivered' && !isOrderReviewed(order._id) && (
							<button
								onClick={() => navigate(`/review/${order._id}`)}
								style={{
									background: '#007bff',
									color: '#fff',
									border: 'none',
									padding: '8px 16px',
									borderRadius: 8,
									cursor: 'pointer',
									marginTop: '10px',
								}}
							>
								Оставить отзыв
							</button>
						)}
						{order.status === 'delivered' && isOrderReviewed(order._id) && (
							<div
								style={{
									background: '#28a745',
									color: '#fff',
									padding: '8px 16px',
									borderRadius: 8,
									marginTop: '10px',
									textAlign: 'center',
									fontSize: '14px',
								}}
							>
								✓ Отзыв оставлен
							</div>
						)}
					</div>
				))}
		</div>
	)
}

export default MyOrders
