import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../config/axios.js'
import { useUserStore } from '../../store/User.js'
import { useLoadingStore } from '../../store/Loading'
import DashboardProductCard from '../../components/DashboardProductCard/DashboardProductCard.jsx'
import './ProductList.scss'
import { useProductStore } from '../../store/Product'

const ProductList = () => {
	const { setLoading: setLoadingGlobal } = useLoadingStore()
	const location = useLocation()
	const [error, setError] = useState(null)
	const [bakerId, setBakerId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [bakerInfo, setBakerInfo] = useState(null)
	const { userInfo, fetchProfile, token } = useUserStore()
	const { bakerProducts, fetchProductsByBaker, updateProduct } = useProductStore()
	const navigate = useNavigate()

	useEffect(() => {
		if (!token) {
			navigate('/register')
		} else {
			fetchProfile()
			if (userInfo?._id) {
				fetchProductsByBaker(userInfo._id)
			}
		}
	}, [token, fetchProfile, navigate, userInfo?._id, fetchProductsByBaker])

	useEffect(() => {
		const params = new URLSearchParams(location.search)
		const baker = params.get('bakerId')
		setBakerId(baker)

		const fetchBakerInfo = async bakerId => {
			try {
				const response = await api.get(`/users/${bakerId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				setBakerInfo(response.data.data)
			} catch (err) {
				console.error('Error fetching baker info:', err)
				toast.error('Failed to fetch baker information')
			}
		}

		if (baker && token) {
			fetchProductsByBaker(baker)
			fetchBakerInfo(baker)
		} else if (userInfo?._id && token) {
			fetchProductsByBaker(userInfo._id)
		}
	}, [location.search, token, userInfo?._id, fetchProductsByBaker])

	const handleToggleAvailability = async (productId, isAvailable) => {
		const result = await updateProduct(
			productId,
			{ isAvailable },
			token
		)
		if (result.success) {
			toast.success('Product availability updated!')
		} else {
			toast.error(result.message || 'Failed to update availability')
		}
	}

	const filteredProducts = useMemo(() => {
        return bakerProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bakerProducts, searchTerm]);

	const stats = useMemo(() => {
		const totalProducts = filteredProducts.length
		const availableProducts = filteredProducts.filter(p => p.isAvailable).length
		const avgPrice = totalProducts > 0 ? filteredProducts.reduce((acc, p) => acc + p.price, 0) / totalProducts : 0;
        const uniqueCategories = [...new Set(filteredProducts.map(p => p.category?.name).filter(Boolean))];

		return {
			totalProducts,
			availableProducts,
			avgPrice,
			uniqueCategories,
		}
	}, [filteredProducts])

	const getTitle = () => {
		if (bakerId && bakerInfo) {
			return `Cakes by ${bakerInfo.name}`
		} else if (bakerId) {
			return 'Cakes by Baker'
		}
		return 'All Products'
	}

	return (
		<div className='product-list-page'>
			<h1>{getTitle()}</h1>

			<div className='search-bar'>
				<input
					type='text'
					placeholder='Search for a cake...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className="product-stats">
                <div className="stat-card">
                    <h4>Total Products</h4>
                    <p>{stats.totalProducts}</p>
                </div>
                <div className="stat-card">
                    <h4>Available</h4>
                    <p>{stats.availableProducts}</p>
                </div>
                <div className="stat-card">
                    <h4>Avg Price</h4>
                    <p>{stats.avgPrice.toFixed(2)} UZS</p>
                </div>
                <div className="stat-card">
                    <h4>Categories</h4>
                    <p>{stats.uniqueCategories.length}</p>
                </div>
            </div>

			{error && <p className='error-message'>{error}</p>}

			<div className='product-grid'>
				{filteredProducts.length > 0 ? (
					filteredProducts.map(product => (
						<DashboardProductCard
							key={product._id}
							product={product}
							onToggleAvailability={handleToggleAvailability}
						/>
					))
				) : (
					<div className='empty-state'>
						<div className='empty-icon'>🧁</div>
						<p>No cakes found.</p>
						<Link to='/addproduct' className='btn btn-primary btn-sm'>
							Add your first cake
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProductList