import { useEffect, useState } from 'react'
import { useUserStore } from '../../store/User'
import { Link, useNavigate } from 'react-router-dom'
import { useProductStore } from '../../store/Product'
import { useCategoryStore } from '../../store/Category'
import { useOrderStore } from '../../store/Order'
import './AdminProfile.scss'
import ProductCard from '../../components/ProductCard'
import profileImage from '../../assets/profile.jpg'
import { ChevronDown, ChevronUp } from 'lucide-react'

const AdminProfile = () => {
	const { userInfo, fetchProfile, logoutUser, token, updateUserProfile } = useUserStore()
	const { orders, customOrders, fetchBakerOrders, updateOrderStatus } =
		useOrderStore()
	const [newCategory, setNewCategory] = useState({ name: '', description: '' })
	const [editingCategory, setEditingCategory] = useState(null)
	const [expandedOrders, setExpandedOrders] = useState(new Set())
	const [autoAcceptOrders, setAutoAcceptOrders] = useState(false)

	useEffect(() => {
		fetchProfile()
	}, [fetchProfile])

	useEffect(() => {
		if (token) fetchBakerOrders(token)
	}, [token, fetchBakerOrders])

	useEffect(() => {
		if (userInfo) {
			setAutoAcceptOrders(userInfo.orderSettings?.autoAccept || false)
		}
	}, [userInfo])

	const navigate = useNavigate()

	const handleLogout = () => {
		logoutUser()
		navigate('/register')
	}

	const {
		products,
		fetchProductsByBaker,
		success: productSuccess,
		error: productError,
		clearMessages: clearProductMessages,
	} = useProductStore()

	const {
		categories,
		fetchCategories,
		createCategory,
		updateCategory,
		deleteCategory,
		loading: categoryLoading,
		error: categoryError,
		success: categorySuccess,
		clearMessages,
	} = useCategoryStore()

	useEffect(() => {
		if (userInfo?._id) {
			fetchProductsByBaker(userInfo._id)
		}
	}, [userInfo, fetchProductsByBaker])

	useEffect(() => {
		fetchCategories()
	}, [fetchCategories])

	const handleCreateCategory = async () => {
		if (!newCategory.name.trim()) {
			return
		}
		const result = await createCategory(newCategory, token)
		if (result.success) {
			setNewCategory({ name: '', description: '' })
			setTimeout(() => clearMessages(), 3000)
		}
	}

	const handleUpdateCategory = async categoryId => {
		if (!editingCategory.name.trim()) {
			return
		}
		const result = await updateCategory(categoryId, editingCategory, token)
		if (result.success) {
			setEditingCategory(null)
			setTimeout(() => clearMessages(), 3000)
		}
	}

	const handleDeleteCategory = async categoryId => {
		if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
			const result = await deleteCategory(categoryId, token)
			if (result.success) {
				setTimeout(() => clearMessages(), 3000)
			}
		}
	}

	const handleDeleteProduct = () => {
		if (userInfo?._id) {
			fetchProductsByBaker(userInfo._id)
		}
		setTimeout(() => clearProductMessages(), 3000)
	}

	const handleStatusUpdate = async (orderId, status) => {
		try {
			await updateOrderStatus(token, orderId, status)
			console.log(`✅ Order ${orderId} status updated to ${status}`)
		} catch (error) {
			console.error('Failed to update order status', error)
		}
	}

	const toggleOrder = orderId => {
		setExpandedOrders(prev => {
			const newExpandedOrders = new Set(prev)
			if (newExpandedOrders.has(orderId)) {
				newExpandedOrders.delete(orderId)
			} else {
				newExpandedOrders.add(orderId)
			}
			return newExpandedOrders
		})
	}

	const getStatusColor = status => {
		switch (status) {
			case 'pending':
				return '#cfc9a8'
			case 'confirmed':
				return '#00b894'
			case 'declined':
				return '#dd3a3a'
			default:
				return '#636e72'
		}
	}

	const getStatusText = status => {
		switch (status) {
			case 'pending':
				return 'Ожидает'
			case 'confirmed':
				return 'Подтвержден'
			case 'declined':
				return 'Отклонен'
			default:
				return status
		}
	}

	const handleSaveChanges = async () => {
		if (!userInfo) return

		const updatedOrderSettings = {
			...userInfo.orderSettings,
			autoAccept: autoAcceptOrders,
		}

		const formData = new FormData()
		formData.append('orderSettings', JSON.stringify(updatedOrderSettings))

		const result = await updateUserProfile(formData)

		if (result.success) {
			// Handle success (e.g., show toast, refresh profile)
			console.log('Order settings updated successfully!')
		} else {
			// Handle error
			console.error('Failed to update order settings:', result.message)
		}
	}

	return (
		<>
			<main className='profile'>
				<div className='left-side'>
					<h1>{userInfo?.name}</h1>
					<nav className='VikaLinks'>
						<button className='logout' onClick={handleLogout}>
							ВЫЙТИ
						</button>
					</nav>
				</div>

				<div className='right-side'>
					<div className='PersonalInfo'>
						<h2>Личные данные</h2>
						<div className='PersonalInfo-container'>
							<div className='PersonalInfo-container-left'>
								<div className='image-container'>
									<img
										src={
											userInfo?.image
												? `${import.meta.env.VITE_BACKEND_BASE_URL}${userInfo.image}`
												: profileImage
										}
										alt={userInfo?.name || 'Profile'}
									/>
									<Link to='/edit-profile'>изменить</Link>
								</div>
								<div className='PersonalInfo-container-left-text'>
									<div className='info-pair'>
										<h3>Имя</h3>
										<p>{userInfo?.name}</p>
									</div>
									<div className='info-pair'>
										<h3>Почта</h3>
										<p>{userInfo?.email}</p>
									</div>
									<div className='info-pair'>
										<h3>Телефон</h3>
										<p>{userInfo?.phone}</p>
									</div>
									{userInfo?.role === 'baker' && (
										<div className='info-pair'>
											<h3>Автоматически принимать заказы</h3>
											<input
												type='checkbox'
												checked={autoAcceptOrders}
												onChange={e => setAutoAcceptOrders(e.target.checked)}
											/>
											<button onClick={handleSaveChanges}>Сохранить настройки заказа</button>
										</div>
									)}
								</div>
							</div>
							<div className='PersonalInfo-container-right'>
								<h3>О себе</h3>
								<p>{userInfo?.bio}</p>
							</div>
						</div>

						<div className='pets'>
							<h2>Мои продукты</h2>
							{productError && <p className='error-message'>{productError}</p>}
							{productSuccess && (
								<p className='success-message'>{productSuccess}</p>
							)}
							<Link to={'/addproduct'}>
								<button className='add-pet'>Добавить продукт</button>
							</Link>
							<Link to={`/admin/product-list?bakerId=${userInfo?._id}`}>
								<button className='add-pet'>Управление продуктами</button>
							</Link>
							<div className='pets-container'>
								{products?.length > 0 ? (
									products.map(product => (
										<ProductCard
											key={product?._id}
											product={product}
											onDelete={handleDeleteProduct}
										/>
									))
								) : (
									<p>No products found for this baker.</p>
								)}
							</div>
						</div>

						{/* Category Management Section */}
						<div className='categories'>
							<h2>Управление категориями</h2>
							{categoryError && (
								<p className='error-message'>{categoryError}</p>
							)}
							{categorySuccess && (
								<p className='success-message'>{categorySuccess}</p>
							)}

							{/* Create Category Form */}
							<div className='create-category'>
								<h3>Создать новую категорию</h3>
								<div className='category-form'>
									<input
										type='text'
										placeholder='Название категории'
										value={newCategory.name}
										onChange={e =>
											setNewCategory({ ...newCategory, name: e.target.value })
										}
									/>
									<textarea
										placeholder='Описание категории (необязательно)'
										value={newCategory.description}
										onChange={e =>
											setNewCategory({
												...newCategory,
												description: e.target.value,
											})
										}
									/>
									<button
										onClick={handleCreateCategory}
										disabled={categoryLoading || !newCategory.name.trim()}
									>
										{categoryLoading ? 'Создание...' : 'Создать категорию'}
									</button>
								</div>
							</div>

							{/* Categories List */}
							<div className='categories-list'>
								<h3>Существующие категории</h3>
								{categories.length > 0 ? (
									<div className='categories-grid'>
										{categories.map(category => (
											<div key={category._id} className='category-item'>
												{editingCategory?._id === category._id ? (
													<div className='edit-category'>
														<input
															type='text'
															value={editingCategory.name}
															onChange={e =>
																setEditingCategory({
																	...editingCategory,
																	name: e.target.value,
																})
															}
														/>
														<textarea
															value={editingCategory.description}
															onChange={e =>
																setEditingCategory({
																	...editingCategory,
																	description: e.target.value,
																})
															}
														/>
														<div className='edit-buttons'>
															<button
																onClick={() =>
																	handleUpdateCategory(category._id)
																}
															>
																Сохранить
															</button>
															<button onClick={() => setEditingCategory(null)}>
																Отмена
															</button>
														</div>
													</div>
												) : (
													<div className='category-display'>
														<h4>{category.name}</h4>
														{category.description && (
															<p>{category.description}</p>
														)}
														<div className='category-actions'>
															<button
																onClick={() => setEditingCategory(category)}
															>
																Редактировать
															</button>
															<button
																onClick={() =>
																	handleDeleteCategory(category._id)
																}
																className='delete-btn'
															>
																Удалить
															</button>
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<p>Категории не найдены.</p>
								)}
							</div>
						</div>

						{/* Order Management Section */}
						<div className='order-management'>
							<h2>Order Management</h2>
							<div className='order-list'>
								<h3>Custom orders</h3>
								{customOrders.length === 0 ? (
									<p>There are no custom orders.</p>
								) : (
									customOrders.map(order => {
										const isExpanded = expandedOrders.has(order._id)
										return (
											<div className='order-card' key={order._id}>
												<div
													className='order-header'
													onClick={() => toggleOrder(order._id)}
												>
													<div className='order-title'>
														<span className='order-number'>
															Заказ #{order.orderNumber}
														</span>
														<span
															className='status-badge'
															style={{
																backgroundColor: getStatusColor(order.status),
															}}
														>
															{getStatusText(order.status)}
														</span>
													</div>
													<div className='expand-icon'>
														{isExpanded ? (
															<ChevronUp size={20} />
														) : (
															<ChevronDown size={20} />
														)}
													</div>
												</div>

												<div
													className={`order-content ${
														isExpanded ? 'expanded' : ''
													}`}
												>
													<div className='order-details'>
														<p>
															<b>Цена:</b> {order.totalPrice} ₽
														</p>
														<p>
															<b>Клиент:</b> {order.user?.name} (
															{order.deliveryInfo.phone})
														</p>
														<p>
															<b>Адрес:</b> {order.deliveryInfo.address},{' '}
															{order.deliveryInfo.city}
														</p>
														<p>
															<b>Детали:</b>
														</p>

														{order.status === 'pending' && (
															<div className='order-actions'>
																<button
																	className='accept-btn'
																	onClick={e => {
																		e.stopPropagation()
																		handleStatusUpdate(order._id, 'confirmed')
																	}}
																>
																	Принять
																</button>
																<button
																	className='reject-btn'
																	onClick={e => {
																		e.stopPropagation()
																		handleStatusUpdate(order._id, 'declined')
																	}}
																>
																	Отклонить
																</button>
															</div>
														)}
													</div>
												</div>
											</div>
										)
									})
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

export default AdminProfile
