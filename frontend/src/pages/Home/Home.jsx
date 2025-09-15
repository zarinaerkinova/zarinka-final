import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
	LuAward,
	LuCake,
	LuChefHat,
	LuMapPin,
	LuShoppingCart,
	LuStar,
	LuTrendingUp,
	LuUsers,
} from 'react-icons/lu'
import { MdAccessTime, MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/Cart'
import { useProductStore } from '../../store/Product'
import { useUserStore } from '../../store/User'
import './Home.scss'

const Home = () => {
	const [bakers, setBakers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [favorites, setFavorites] = useState(new Set())
	const { fetchProducts, products } = useProductStore()

	useEffect(() => {
		const fetchBakers = async () => {
			try {
				const res = await axios.get('/api/auth/bakers')
				setBakers(res.data)
				setLoading(false)
			} catch (err) {
				console.error('Error fetching bakers:', err)
				setError('Failed to load bakers.')
				setLoading(false)
			}
		}

		fetchBakers()
	}, [])

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	const toggleFavorite = id => {
		setFavorites(prev => {
			const newFavorites = new Set(prev)
			if (newFavorites.has(id)) {
				newFavorites.delete(id)
			} else {
				newFavorites.add(id)
			}
			return newFavorites
		})
	}

	const renderStars = rating => {
		return [...Array(5)].map((_, i) => (
			<LuStar key={i} className={i < Math.floor(rating) ? 'filled' : 'empty'} />
		))
	}

	const ProductCard = ({ product }) => {
		const navigate = useNavigate()
		const { user, token } = useUserStore()
		const { addToCart, isInCart, getCartItemQuantity } = useCartStore()
		const [isAdding, setIsAdding] = useState(false)

		const itemInCart = isInCart(product._id)
		const cartQuantity = getCartItemQuantity(product._id)

		const handleAddToCart = async e => {
			e.stopPropagation()
			if (!user || !token) return toast.error('Please log in to add to cart.')

			setIsAdding(true)

			try {
				await addToCart(product, token, 1)
				toast.success(`${product.name} added to cart ✅`)
			} catch (error) {
				console.error('Cart operation failed:', error)
				toast.error('Failed to add to cart')
			} finally {
				setIsAdding(false)
			}
		}

		const imageUrl = product?.image?.startsWith('http')
			? product.image
			: `http://localhost:5000${product?.image || '/placeholder.png'}`

		return (
			<div className='product-card'>
				<div className='card-image'>
					<img src={imageUrl} alt={product.name} />
					<button
						className={`favorite-btn ${
							favorites.has(product._id) ? 'active' : ''
						}`}
						onClick={() => toggleFavorite(product._id)}
					>
						{favorites.has(product._id) ? <MdFavorite /> : <MdFavoriteBorder />}
					</button>
				</div>
				<div className='card-content'>
					<div className='card-header'>
						<h3>{product.name}</h3>
						<div className='baker-info'>
							By <span>{product.baker?.name || 'Professional Baker'}</span>
						</div>
					</div>
					<div className='rating'>
						<div className='stars'>{renderStars(product.rating || 4.5)}</div>
						<span className='rating-text'>
							({product.reviewCount || 23} reviews)
						</span>
					</div>
					<div className='price'>
						${product.price}
						{product.originalPrice && <span>${product.originalPrice}</span>}
					</div>
					<div className='card-actions'>
						<div className='primary-actions'>
							<button
								onClick={handleAddToCart}
								className={`add-to-cart ${itemInCart ? 'added' : ''}`}
								disabled={isAdding}
							>
								<LuShoppingCart />
								{isAdding
									? 'Processing...'
									: itemInCart
									? `Added (${cartQuantity}) `
									: 'Add to cart'}
							</button>
							<button
								className='buy-now'
								onClick={() => navigate(`/product/${product._id}`)}
							>
								Buy Now
							</button>
						</div>
						<Link to={`/cakes/${product._id}`} className='customize'>
							Customize
						</Link>
					</div>
				</div>
			</div>
		)
	}

	const BakerCardComponent = ({ baker }) => (
		<div className='baker-card'>
			<div className='baker-header'>
				<div className='baker-avatar'>
					{baker.image && !baker.image.includes('default.png') ? (
						<img
							src={`${import.meta.env.VITE_API_URL}${baker.image}`}
							alt={baker.bakeryName || baker.name}
						/>
					) : (
						<div className='specialist-initials-container'>
							<div className='specialist-initials-home'>
								{baker.bakeryName?.charAt(0) || baker.name?.charAt(0) || 'B'}
							</div>
						</div>
					)}
				</div>
				<div className='baker-info'>
					<h3>{baker.bakeryName || 'Sweet Dreams Bakery'}</h3>
					<div className='baker-name'>{baker.name}</div>
				</div>
				<button
					className={`favorite-btn ${favorites.has(baker._id) ? 'active' : ''}`}
					onClick={() => toggleFavorite(baker._id)}
				>
					{favorites.has(baker._id) ? <MdFavorite /> : <MdFavoriteBorder />}
				</button>
			</div>
			<div className='baker-details'>
				<div className='rating'>
					<div className='stars'>{renderStars(baker.rating || 4.7)}</div>
					<span>({baker.reviewCount || 45} reviews)</span>
				</div>
				<div className='location'>
					<LuMapPin />
					<span>{baker.location || 'Downtown, City'}</span>
				</div>
				<div className='hashtags'>
					{(
						baker.specialties || ['Custom Cakes', 'Wedding Cakes', 'Cupcakes']
					).map((tag, index) => (
						<span key={index} className='hashtag'>
							#{tag}
						</span>
					))}
				</div>
				<div
					className={`availability ${
						baker.available === false ? 'unavailable' : ''
					}`}
				>
					{baker.available !== false ? 'Available Now' : 'Busy'}
				</div>
			</div>
			<div className='baker-actions'>
				                <Link to={`/bakers/${baker._id}`}>
				                    <button className='view-profile'>View Profile</button>
				                </Link>				<Link to='/custom'></Link>
			</div>
		</div>
	)

	return (
		<>
			{/* Hero Section - Promotions & Intro */}
			<div className='hero'>
				<div className='container'>
					<h1>Custom Cakes Made with Love</h1>
					<p>
						Connect with local artisan bakers and create the perfect cake for
						your special moments. From custom designs to ready-made delights, we
						bring sweetness to your celebrations.
					</p>
					<div className='btns'>
						<Link to='/custom'>
							<button>
								<LuCake /> Build Custom Cake
							</button>
						</Link>
						<Link to='/cakes'>
							<button>Browse Ready-Made</button>
						</Link>
					</div>
				</div>
			</div>

			{/* Popular Cakes Section */}
			<section className='cakes'>
				<div className='container'>
					<div className='top'>
						<h2>Popular Cakes</h2>
						<Link to={'/cakes'} className='viewAll'>
							View All Cakes
						</Link>
					</div>

					<div className='product_cards'>
						{products && products.length > 0 ? (
							products
								.slice(0, 6)
								.map(product => (
									<ProductCard key={product._id} product={product} />
								))
						) : (
							<div className='loading-grid'>
								{[...Array(6)].map((_, i) => (
									<div key={i} className='product-card loading'>
										<div className='card-image skeleton'></div>
										<div className='card-content'>
											<div className='skeleton-text'></div>
											<div className='skeleton-text short'></div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Constructor Section */}
			<section className='constructor-section'>
				<div className='container'>
					<h2>Build Your Dream Cake</h2>
					<p>
						Use our interactive cake constructor to design the perfect cake for
						your special occasion. Choose flavors, decorations, and personalize
						every detail with our talented bakers.
					</p>
					<Link to='/cakes' className='constructor-link'>
						<LuCake />
						Start Building Your Cake
					</Link>
				</div>
			</section>

			{/* Featured Bakers Section */}
			<section className='bakers_home'>
				<div className='container'>
					<div className='top'>
						<h2>Featured Bakers</h2>
						<Link to={'/bakers'} className='viewAll'>
							View All Bakers
						</Link>
					</div>

					<div className='list_bakers'>
						{loading && (
							<div className='bakers-list'>
								{[...Array(6)].map((_, i) => (
									<div key={i} className='baker-card loading'>
										<div className='baker-header'>
											<div className='baker-avatar skeleton'></div>
											<div className='baker-info'>
												<div className='skeleton-text'></div>
												<div className='skeleton-text short'></div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
						{error && (
							<p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
						)}
						<div className='bakers-list'>
							{bakers.slice(0, 6).map((baker, index) => (
								<BakerCardComponent key={baker._id || index} baker={baker} />
							))}
						</div>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section className='about-section'>
				<div className='container'>
					<h2>About Zarinka</h2>
					<p className='intro-text'>
						We are passionate about connecting cake lovers with talented local
						bakers. Our platform brings together creativity, quality, and
						convenience to make every celebration sweeter and more memorable.
					</p>

					<div className='about-images'>
						<div className='about-image'>
							<img
								src='/api/placeholder/300/200'
								alt='Professional baker decorating cake'
							/>
						</div>
						<div className='about-image'>
							<img
								src='/api/placeholder/300/200'
								alt='Beautiful custom wedding cake'
							/>
						</div>
						<div className='about-image'>
							<img
								src='/api/placeholder/300/200'
								alt='Colorful birthday cake collection'
							/>
						</div>
						<div className='about-image'>
							<img
								src='/api/placeholder/300/200'
								alt="Baker's workspace with ingredients"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Why Choose Us Section */}
			<section className='why'>
				<div className='container'>
					<h2>Why Choose Zarinka?</h2>
					<p className='context'>
						We connect you with passionate local bakers who create exceptional
						custom cakes and baked goods
					</p>

					<div className='features'>
						<div className='feature'>
							<div className='img'>
								<LuChefHat />
							</div>
							<h3>Expert Bakers</h3>
							<p>
								Skilled artisan bakers with years of experience and passion for
								their craft, ensuring every cake is a masterpiece
							</p>
						</div>
						<div className='feature'>
							<div className='img'>
								<LuCake />
							</div>
							<h3>Custom Designs</h3>
							<p>
								Create unique cakes tailored to your vision with our interactive
								cake builder and personalization options
							</p>
						</div>
						<div className='feature'>
							<div className='img'>
								<MdAccessTime />
							</div>
							<h3>Real-time Tracking</h3>
							<p>
								Follow your order from preparation to completion with live
								progress updates and delivery notifications
							</p>
						</div>
						<div className='feature'>
							<div className='img'>
								<LuUsers />
							</div>
							<h3>Community Focused</h3>
							<p>
								Supporting local businesses while bringing communities together
								through the joy of exceptional baked goods
							</p>
						</div>
						<div className='feature'>
							<div className='img'>
								<LuAward />
							</div>
							<h3>Quality Guaranteed</h3>
							<p>
								Every baker on our platform is vetted for quality, reliability,
								and commitment to using premium ingredients
							</p>
						</div>
						<div className='feature'>
							<div className='img'>
								<LuTrendingUp />
							</div>
							<h3>Competitive Pricing</h3>
							<p>
								Fair, transparent pricing with no hidden fees, plus special
								offers and loyalty rewards for regular customers
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default Home