import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IngredientsTooltip from '../../components/IngredientsTooltip/IngredientsTooltip.jsx'
import { useOrderStore } from '../../store/Order'
import { useUserStore } from '../../store/User'
import './NewOrders.scss'

const NewOrders = () => {
	const { newOrders, fetchBakerOrders, updateOrderStatus, deleteOrder } = useOrderStore()
	const { token } = useUserStore()
	const [isProcessing, setIsProcessing] = useState({})
	const navigate = useNavigate()

	useEffect(() => {
		if (token) {
			fetchBakerOrders(token)
		}
	}, [token, fetchBakerOrders])

	const handleAccept = async orderId => {
		setIsProcessing(prev => ({ ...prev, [orderId]: 'accepting' }))
		try {
			await updateOrderStatus(token, orderId, 'accepted')
			navigate('/profile')
		} catch (error) {
			console.error('Error accepting order:', error)
		} finally {
			setIsProcessing(prev => ({ ...prev, [orderId]: null }))
		}
	}

	const handleReject = async orderId => {
		setIsProcessing(prev => ({ ...prev, [orderId]: 'rejecting' }))
		try {
			await deleteOrder(token, orderId)
			// Refresh the orders list to remove the rejected order
			fetchBakerOrders(token)
		} catch (error) {
			console.error('Error rejecting order:', error)
		} finally {
			setIsProcessing(prev => ({ ...prev, [orderId]: null }))
		}
	}

	const formatAddress = (deliveryInfo, deliveryMethod) => {
		if (deliveryMethod !== 'delivery' || !deliveryInfo) {
			return 'Pickup'
		}

		const { streetAddress, city, zipCode } = deliveryInfo
		const addressParts = [streetAddress, city, zipCode].filter(Boolean)
		return addressParts.length > 0 ? addressParts.join(', ') : 'Pickup'
	}

	const getItemPrice = item => {
		return item.price ?? item.product?.price ?? 0
	}

	const getItemName = item => {
		return item.product?.name || item.name || 'Unnamed Product'
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
									{formatAddress(order.deliveryInfo, order.deliveryMethod)}
								</p>
								<p>
									<strong>Delivery Type:</strong>{' '}
									{order.deliveryMethod === 'delivery'
										? 'Доставка'
										: 'Самовывоз'}
								</p>
								<p>
									<strong>Payment Type:</strong>{' '}
									{order.paymentMethod === 'cash'
										? 'Наличные'
										: order.paymentMethod === 'card'
										? 'Карта'
										: order.paymentMethod}
								</p>
								<p>
									<strong>Total:</strong> {order.totalPrice} ₽
								</p>
							</div>

							<div className='item-info'>
								<h4>Items</h4>
								{order.items.map(item => (
									<div key={item._id} className='item'>
										<img
											src={
												item.product?.image
													? `${import.meta.env.VITE_BACKEND_BASE_URL}${item.product.image}`
													: '/placeholder.png'
											}
											alt={getItemName(item)}
											loading='lazy'
										/>
										<div>
											<p>{getItemName(item)}</p>
											{item.product?.description && (
												<p className='item-description'>
													{item.product.description}
												</p>
											)}
											<p>
												<strong>Price:</strong> {getItemPrice(item)} ₽
											</p>
											<p>
												<strong>Quantity:</strong> {item.quantity}
											</p>
											{item.selectedSize && (
												<p>
													<strong>Size:</strong> {item.selectedSize.label}
												</p>
											)}
											<IngredientsTooltip
												ingredients={
													item.customizedIngredients?.length > 0
														? item.customizedIngredients
														: item.product?.ingredients
												}
											/>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className='order-actions'>
							<button
								onClick={() => handleReject(order._id)}
								className='btn-reject'
								disabled={isProcessing[order._id]}
							>
								{isProcessing[order._id] === 'rejecting'
									? 'Deleting...'
									: 'Decline'}
							</button>
							<button
								onClick={() => handleAccept(order._id)}
								className='btn-accept'
								disabled={isProcessing[order._id]}
							>
								{isProcessing[order._id] === 'accepting'
									? 'Accepting...'
									: 'Accept'}
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