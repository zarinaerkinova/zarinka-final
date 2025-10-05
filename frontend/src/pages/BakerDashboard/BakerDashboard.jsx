import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardOrderCard from '../../components/DashboardOrderCard/DashboardOrderCard'
import DashboardProductCard from '../../components/DashboardProductCard/DashboardProductCard'
import { useOrderStore } from '../../store/Order'
import { useProductStore } from '../../store/Product'
import { useUserStore } from '../../store/User'
import './BakerDashboard.scss'

const BakerDashboard = () => {
	const { t } = useTranslation()
	const { userInfo, fetchProfile, logoutUser, token } = useUserStore()
	const { newOrders, completedOrders, allBakerOrders, fetchBakerOrders } =
		useOrderStore()
	const { bakerProducts, fetchProductsByBaker } = useProductStore()
	const navigate = useNavigate()

	useEffect(() => {
		fetchProfile()
		fetchBakerOrders(token)
		if (userInfo?._id) {
			fetchProductsByBaker(userInfo._id)
		}
	}, [
		fetchProfile,
		fetchBakerOrders,
		token,
		userInfo?._id,
		fetchProductsByBaker,
	])

	const handleLogout = () => {
		logoutUser()
		navigate('/register')
	}

	return (
		<div className='enhanced-baker-dashboard'>
			{/* Animated Background */}
			<div className='dashboard-background'>
				<div className='bg-orb orb-1'></div>
				<div className='bg-orb orb-2'></div>
				<div className='bg-orb orb-3'></div>
				<div className='grid-pattern'></div>
			</div>

			{/* Main Content */}
			<div className='dashboard-container'>
				{/* Enhanced Header */}
				<header className='dashboard-header'>
					<div className='header-content'>
						<div className='baker-info'>
							<div className='profile-section'>
								<div className='baker-profile-image-container'>
									{userInfo?.image ? (
										<img
											src={userInfo.image.startsWith('http') ? userInfo.image : `${import.meta.env.VITE_BACKEND_BASE_URL}${userInfo.image}`}
											alt={t('baker_dashboard_baker_profile')}
											className='baker-profile-image'
										/>
									) : (
										<div className='baker-initials-container'>
											<div className='baker-initials'>
												{userInfo?.name?.charAt(0) || 'B'}
											</div>
										</div>
									)}
									<div className='profile-ring'></div>
								</div>
							</div>
							<div className='baker-details'>
								<h1 className='baker-name'>{userInfo?.name}</h1>
								<h2 className='bakery-name'>{userInfo?.bakeryName}</h2>
								<div className='rating-display'>
									<span className='rating-stars'>
										{Array.from({ length: 5 }, (_, i) => (
											<span
												key={i}
												className={`star ${
													i < Math.floor(userInfo?.rating || 0) ? 'filled' : ''
												}`}
											>
												★
											</span>
										))}
									</span>
									<span className='rating-value'>
										{userInfo?.rating?.toFixed(1) || 'N/A'}
									</span>
								</div>
							</div>
						</div>

						{/* Button Group вместо бургер-меню */}
						<div className='dashboard-button-group'>
							<Link to='/addproduct' className='btn-group-btn'>
								<span className='btn-icon'>➕</span>
								<span className='btn-text'>{t('baker_dashboard_add_product')}</span>
							</Link>

							<Link to='/product-list' className='btn-group-btn'>
								<span className='btn-icon'>📦</span>
								<span className='btn-text'>{t('baker_dashboard_manage_products')}</span>
							</Link>

							<Link to='/edit-profile' className='btn-group-btn'>
								<span className='btn-icon'>👤</span>
								<span className='btn-text'>{t('baker_dashboard_edit_profile')}</span>
							</Link>
						</div>
					</div>
				</header>

				{/* Stats Grid */}
				<section className='stats-grid'>
					<Link to='/baker/orders/new' className='stat-card new-orders'>
						<div className='stat-icon'>📋</div>
						<div className='stat-content'>
							<h3>{t('baker_dashboard_new_orders')}</h3>
							<p className='stat-number'>{newOrders.length}</p>
							<span className='stat-label'>{t('baker_dashboard_pending')}</span>
						</div>
						<div className='stat-trend'>
							<span className='trend-up'>↗</span>
						</div>
					</Link>

					<Link
						to='/baker/orders/completed'
						className='stat-card completed-orders'
					>
						<div className='stat-icon'>✅</div>
						<div className='stat-content'>
							<h3>{t('baker_dashboard_completed')}</h3>
							<p className='stat-number'>{completedOrders.length}</p>
							<span className='stat-label'>{t('baker_dashboard_finished')}</span>
						</div>
						<div className='stat-trend'>
							<span className='trend-up'>↗</span>
						</div>
					</Link>

					<Link to='/baker/reviews' className='stat-card rating-card'>
						<div className='stat-icon'>⭐</div>
						<div className='stat-content'>
							<h3>{t('baker_dashboard_rating')}</h3>
							<p className='stat-number'>
								{userInfo?.rating?.toFixed(1) || 'N/A'}
							</p>
							<span className='stat-label'>{t('baker_dashboard_average')}</span>
						</div>
						<div className='stat-trend'>
							<span className='trend-up'>↗</span>
						</div>
					</Link>
				</section>

				{/* Dashboard Sections */}
				<div className='dashboard-sections'>
					{/* Orders Section */}
					<section className='orders-section'>
						<div className='section-header'>
							<h2>{t('baker_dashboard_recent_orders')}</h2>
							<Link to={'/all-orders'} className='view-all-btn'>
								{t('baker_dashboard_view_all')} →
							</Link>

						</div>
						<div className='order-list'>
							{allBakerOrders.length > 0 ? (
								allBakerOrders
									.slice(0, 5)
									.map(order => (
										<DashboardOrderCard key={order._id} order={order} />
									))
							) : (
								<div className='empty-state'>
									<div className='empty-icon'>📦</div>
									<p>{t('baker_dashboard_no_orders')}</p>
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>
	)
}

export default BakerDashboard
