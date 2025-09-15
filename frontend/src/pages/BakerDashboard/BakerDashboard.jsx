import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardOrderCard from '../../components/DashboardOrderCard/DashboardOrderCard'
import DashboardProductCard from '../../components/DashboardProductCard/DashboardProductCard'
import { useOrderStore } from '../../store/Order'
import { useProductStore } from '../../store/Product'
import { useUserStore } from '../../store/User'
import './BakerDashboard.scss'

const BakerDashboard = () => {
	const { userInfo, fetchProfile, logoutUser, token } = useUserStore()
	const { newOrders, completedOrders, allBakerOrders, fetchBakerOrders } =
		useOrderStore()
	const { bakerProducts, fetchProductsByBaker } = useProductStore()
	const navigate = useNavigate()

	useEffect(() => {
		if (!token) {
			navigate('/register')
		} else {
			fetchProfile()
			fetchBakerOrders(token) // This now fetches all three types of orders
			if (userInfo?._id) {
				fetchProductsByBaker(userInfo._id)
			}
		}
	}, [
		token,
		fetchProfile,
		fetchBakerOrders,
		navigate,
		userInfo?._id,
		fetchProductsByBaker,
	])

	const handleLogout = () => {
		logoutUser()
		navigate('/register')
	}

	return (
		<div className='baker-dashboard'>
			<header className='dashboard-header'>
				<div className='baker-info'>
					<div className='baker-profile-image-container'>
						{userInfo?.image ? (
							<img
								src={`http://localhost:5000${userInfo.image}`}
								alt='Baker Profile'
								className='baker-profile-image'
							/>
						) : (
							<div className='baker-initials-container'>
								<div className='baker-initials'>
									{userInfo?.name?.charAt(0) || 'B'}
								</div>
							</div>
						)}
					</div>
					<h1>{userInfo?.name}</h1>
					<h2>{userInfo?.bakeryName}</h2>
				</div>
				<div className='dashboard-actions'>
					<Link to='/addproduct' className='btn btn-primary'>
						Add Product
					</Link>
				</div>
			</header>

			<main className='dashboard-content'>
				<section className='counts-section'>
					<Link to='/baker/orders/new' className='count-card'>
						<h3>New Orders</h3>
						<p>{newOrders.length}</p>
					</Link>
					<Link to='/baker-orders' className='count-card'>
						<h3>All Baker Orders</h3>
						<p>{allBakerOrders.length}</p>
					</Link>
					<Link to='/baker/orders/completed' className='count-card'>
						<h3>Completed Orders</h3>
						<p>{completedOrders.length}</p>
					</Link>
					<Link to='/baker/reviews' className='count-card'>
						<h3>Average Rating</h3>
						<p>{userInfo?.rating?.toFixed(1) || 'N/A'}</p>
					</Link>
				</section>

				<section className='all-orders-section'>
					<h2>All Orders</h2>
					<div className='order-list'>
						{allBakerOrders.length > 0 ? (
							allBakerOrders.map(order => (
								<DashboardOrderCard key={order._id} order={order} />
							))
						) : (
							<p>No orders found.</p>
						)}
					</div>
				</section>

				<section className='manage-products-section'>
					<h2>Manage Products</h2>
					<div className='product-counts'>
						<div className='count-card'>
							<h3>Total Products</h3>
							<p>{bakerProducts.length}</p>
						</div>
						<div className='count-card'>
							<h3>Available Products</h3>
							<p>{bakerProducts.filter(p => p.isAvailable).length}</p>
						</div>
					</div>
					<div className='product-filters'>
						<input
							type='text'
							placeholder='Search your products...'
							className='search-bar'
						/>
						{/* Add category and availability filters here */}
					</div>
					<div className='product-list'>
						{bakerProducts.length > 0 ? (
							bakerProducts.map(product => (
								<DashboardProductCard key={product._id} product={product} />
							))
						) : (
							<p>No products found.</p>
						)}
					</div>
				</section>
			</main>
		</div>
	)
}

export default BakerDashboard
