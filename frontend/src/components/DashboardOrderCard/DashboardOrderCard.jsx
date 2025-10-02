import React, { useState } from 'react'
import { useOrderStore } from '../../store/Order'
import { useUserStore } from '../../store/User'
import './DashboardOrderCard.scss'

const DashboardOrderCard = ({ order }) => {
	const { updateOrderStatus, deleteOrder } = useOrderStore()
	const { token } = useUserStore()
	const [status, setStatus] = useState(order?.status)
	const [showDetails, setShowDetails] = useState(false);

	const handleStatusChange = async newStatus => {
		await updateOrderStatus(token, order._id, newStatus)
		setStatus(newStatus)
	}

	const handleDeleteOrder = async () => {
		if (window.confirm('Are you sure you want to delete this order?')) {
			await deleteOrder(token, order._id);
		}
	};

	const getProgress = () => {
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
		<div className='dashboard-order-card'>
			<div className='card-main-info'>
				<img
					src={
						order?.items?.[0]?.product?.image
							? `${import.meta.env.VITE_BACKEND_BASE_URL}${order.items[0].product.image}`
							: '/placeholder.png'
					}
					alt={order?.items?.[0]?.product?.name || 'Product'}
				/>
				<div className='order-details'>
					<h4>
						{(order?.items || [])
							.map(item => item?.product?.name || item.name)
							.filter(Boolean)
							.join(', ') || 'Order'}
					</h4>
					<p className='customer-name'>
						Customer: {order?.deliveryInfo?.name || '—'}
					</p>
					<p className='price'>{order?.totalPrice ?? 0} ₽</p>
					<p className='order-id'>ID: {order?._id}</p>
					
				</div>
			</div>
			<div className='order-status-management'>
				{order.status === 'pending' ? (
					<div className='status-buttons'>
						<button onClick={() => handleStatusChange('accepted')} className='status-btn accept'>
							Accept
						</button>
						<button onClick={() => handleStatusChange('declined')} className='status-btn decline'>
							Decline
						</button>
					</div>
				) : order.status === 'declined' || order.status === 'delivered' ? (
					<div className='status-buttons'>
						<button onClick={handleDeleteOrder} className='status-btn delete'>
							Delete
						</button>
					</div>
				) : (
					<div className='status-buttons'>
						<button
							onClick={() => handleStatusChange('accepted')}
							className={`status-btn ${status === 'accepted' ? 'active' : ''}`}
						>
							Accepted
						</button>
						<button
							onClick={() => handleStatusChange('confirmed')}
							className={`status-btn ${status === 'confirmed' ? 'active' : ''}`}
						>
							Cooking
						</button>
						<button
							onClick={() => handleStatusChange('shipped')}
							className={`status-btn ${status === 'shipped' ? 'active' : ''}`}
						>
							Delivery
						</button>
						<button
							onClick={() => handleStatusChange('delivered')}
							className={`status-btn ${status === 'delivered' ? 'active' : ''}`}
						>
							Completed
						</button>
					</div>
				)}
				<div className='progress-bar-container'>
					<div
						className='progress-bar'
						style={{ width: `${getProgress()}%` }}
					></div>
				</div>
			</div>
		</div>
	)
}

export default DashboardOrderCard