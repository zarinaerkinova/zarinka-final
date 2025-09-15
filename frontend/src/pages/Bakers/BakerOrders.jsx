import React, { useEffect } from 'react' // Added a comment to force recompile
import { useOrderStore } from '../../store/Order'
import { useUserStore } from '../../store/User'
import './BakerOrders.css'

const BakerOrders = () => {
	const { token } = useUserStore()
	const {
		orders,
		customOrders,
		fetchBakerOrders,
		updateOrderStatus,
		deleteOrder,
	} = useOrderStore()

	useEffect(() => {
		if (token) fetchBakerOrders(token)
	}, [token, fetchBakerOrders])

	const handleStatusUpdate = async (orderId, status) => {
		try {
			await updateOrderStatus(token, orderId, status)
			console.log(`✅ Order ${orderId} status updated to ${status}`)
			// Refresh the orders list to show updated status
			fetchBakerOrders(token)
		} catch (error) {
			console.error('Failed to update order status', error)
		}
	}

	const handleDeleteOrder = async orderId => {
		if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
			try {
				await deleteOrder(token, orderId)
				console.log(`✅ Order ${orderId} deleted successfully`)
				fetchBakerOrders(token)
			} catch (error) {
				console.error('Failed to delete order', error)
			}
		}
	}
	return (
		<div className='baker-orders-container'>
			<h1>Standard Orders</h1>
			<div className='order-list'>
				{orders.length === 0 ? (
					<p>No standard orders yet</p>
				) : (
					orders.map(order => (
						<div className='order-card' key={order._id}>
							<p>
								<b>Order #{order.orderNumber}</b>
							</p>
							<p>
								<b>Total:</b> {order.totalPrice} ₽
							</p>
							<p>
								<b>Customer:</b> {order.user?.name || 'Unknown'}
							</p>
							<p>
								<b>Items:</b>
							</p>
							<ul>
								{order.items?.map(i => (
									<li key={i.product?._id}>
										{i.product?.name || 'Unknown product'} x{i.quantity}
									</li>
								))}
							</ul>
							<p>
								<b>Status:</b>{' '}
								<span className={`status-badge status-${order.status}`}>
									{order.status}
								</span>
							</p>
							<div className='order-actions'>
								{order.status === 'pending' && (
									<>
										<button
											className='accept-btn'
											onClick={() => handleStatusUpdate(order._id, 'accepted')}
										>
											Принять
										</button>
										<button
											className='reject-btn'
											onClick={() => handleStatusUpdate(order._id, 'declined')}
										>
											Отклонить
										</button>
									</>
								)}
								{order.status === 'accepted' && (
									<button
										className='progress-btn'
										onClick={() => handleStatusUpdate(order._id, 'preparing')}
									>
										Preparing
									</button>
								)}
								{order.status === 'confirmed' && (
									<button
										className='progress-btn'
										onClick={() => handleStatusUpdate(order._id, 'shipped')}
									>
										Delivery
									</button>
								)}
								{order.status === 'shipped' && (
									<button
										className='completed-btn'
										onClick={() => handleStatusUpdate(order._id, 'delivered')}
									>
										Completed
									</button>
								)}
								<button
									className='delete-btn'
									onClick={() => handleDeleteOrder(order._id)}
									title='Удалить заказ'
								>
									🗑️ Удалить
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<h1>Custom Cake Orders</h1>
			<div className='order-list'>
				{customOrders.length === 0 ? (
					<p>No custom orders yet</p>
				) : (
					customOrders.map(order => (
						<div className='order-card' key={order._id}>
							<p>
								<b>Order #{order.orderNumber}</b>
							</p>
							<p>
								<b>Price:</b> {order.totalPrice} ₽
							</p>
							<p>
								<b>Customer:</b> {order.user?.name || 'Unknown'} (
								{order.deliveryInfo?.phone || 'No phone'})
							</p>
							<p>
								<b>Address:</b>{' '}
								{order.deliveryInfo?.streetAddress || 'No address'},{' '}
								{order.deliveryInfo?.city || 'No city'}
							</p>
							<p>
								<b>Details:</b>
							</p>
							<ul>
								<li>
									<b>Sponge:</b> {order.details?.sponge || 'Not specified'}
								</li>
								<li>
									<b>Cream:</b> {order.details?.cream || 'Not specified'}
								</li>
								<li>
									<b>Decoration:</b> {order.details?.decor || 'Not specified'}
								</li>
							</ul>
							<p>
								<b>Status:</b>{' '}
								<span className={`status-badge status-${order.status}`}>
									{order.status}
								</span>
							</p>
							<div className='order-actions'>
								{order.status === 'pending' && (
									<>
										<button
											className='accept-btn'
											onClick={() => handleStatusUpdate(order._id, 'accepted')}
										>
											Принять
										</button>
										<button
											className='reject-btn'
											onClick={() => handleStatusUpdate(order._id, 'declined')}
										>
											Отклонить
										</button>
									</>
								)}
								{order.status === 'accepted' && (
									<button
										className='progress-btn'
										onClick={() => handleStatusUpdate(order._id, 'confirmed')}
									>
										In Progress
									</button>
								)}
								{order.status === 'confirmed' && (
									<button
										className='progress-btn'
										onClick={() => handleStatusUpdate(order._id, 'shipped')}
									>
										Delivery
									</button>
								)}
								{order.status === 'shipped' && (
									<button
										className='completed-btn'
										onClick={() => handleStatusUpdate(order._id, 'delivered')}
									>
										Completed
									</button>
								)}
								<button
									className='delete-btn'
									onClick={() => handleDeleteOrder(order._id)}
									title='Удалить заказ'
								>
									🗑️ Удалить
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}

export default BakerOrders
