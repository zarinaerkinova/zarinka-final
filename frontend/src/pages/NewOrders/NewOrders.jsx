import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore } from '../../store/Order'
import { useUserStore } from '../../store/User'
import './NewOrders.scss'

const NewOrders = () => {
	const { orders, fetchBakerOrders, updateOrderStatus } = useOrderStore()
	const { token } = useUserStore()
	const [rejectionReasons, setRejectionReasons] = useState({})
	const navigate = useNavigate()

	useEffect(() => {
		if (token) {
			fetchBakerOrders(token)
		}
	}, [token, fetchBakerOrders])

	const newOrders = orders.filter(order => order.status === 'pending')

	const handleAccept = async orderId => {
		try {
			await updateOrderStatus(token, orderId, 'accepted')
			// Navigate to orders list after successful acceptance
			navigate('/baker-orders')
		} catch (error) {
			console.error('Error accepting order:', error)
		}
	}

	const handleReject = async orderId => {
		try {
			const reason = rejectionReasons[orderId] || ''
			await updateOrderStatus(token, orderId, 'declined', reason)
			// Refresh the orders list to remove the rejected order
			fetchBakerOrders(token)
		} catch (error) {
			console.error('Error rejecting order:', error)
		}
	}

	const handleReasonChange = (orderId, reason) => {
		setRejectionReasons(prev => ({ ...prev, [orderId]: reason }))
	}

	return (
		<div className='new-orders-page'>
			<h1>Новые заказы</h1>
			{newOrders.length > 0 ? (
				newOrders.map(order => (
					<div key={order._id} className='order-card'>
						<div className='order-details'>
							<div className='customer-info'>
								<h4>Customer</h4>
								<p>
									<strong>Name:</strong> {order.deliveryInfo?.name || '—'}
								</p>
								<p>
									<strong>Phone:</strong> {order.deliveryInfo?.phone || '—'}
								</p>
								<p>
									<strong>Address:</strong>{' '}
									{order.deliveryMethod === 'delivery' && order.deliveryInfo
										? `${order.deliveryInfo?.streetAddress || ''}, ${
												order.deliveryInfo?.city || ''
										  }, ${order.deliveryInfo?.zipCode || ''}`
										: 'Pickup'}
								</p>
								<p>
									<strong>Delivery Type:</strong> {order.deliveryMethod}
								</p>
								<p>
									<strong>Payment Type:</strong> {order.paymentMethod}
								</p>
							</div>
							<div className='item-info'>
								<h4>Items</h4>
								{order.items.map(item => (
									<div
										key={item._id} // Use item._id for unique key
										className='item'
									>
										<img
											src={
												item.product?.image // For regular products
													? `http://localhost:5000${item.product.image}`
													: '/placeholder.png' // Placeholder for custom cakes
											}
											alt={item.product?.name || item.name || 'Product'} // Use item.name for custom cakes
										/>
										<div>
											<p>{item.product?.name || item.name || '—'}</p>
											<p className="item-description">{item.product?.description || ''}</p>
											<p>
												<strong>Price:</strong> {item.selectedSize?.price ?? item.product?.price ?? item.price ?? '—'} ₽
											</p>
											{item.selectedSize && (
												<p>
													<strong>Size:</strong> {item.selectedSize.label}
												</p>
											)}
											{item.customizedIngredients && item.customizedIngredients.length > 0 && (
												<p>
													<strong>Ingredients:</strong> {item.customizedIngredients.map(ing => ing.name).join(', ')}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
						<div className='order-actions'>
							<div className='rejection-section'>
								<input
									type='text'
									placeholder='Причина отклонения (необязательно)'
									onChange={e => handleReasonChange(order._id, e.target.value)}
								/>
								<button
									onClick={() => handleReject(order._id)}
									className='btn-reject'
								>
									Отклонить
								</button>
							</div>
							<button
								onClick={() => handleAccept(order._id)}
								className='btn-accept'
							>
								Принять
							</button>
						</div>
					</div>
				))
			) : (
				<p>Нет новых заказов.</p>
			)}
		</div>
	)
}

export default NewOrders
