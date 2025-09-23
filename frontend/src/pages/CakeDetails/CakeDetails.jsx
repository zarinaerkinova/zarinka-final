import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaShoppingCart, FaStar } from 'react-icons/fa'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CakeAccordion from '../../components/CakeAccordion.jsx'
import { useCartStore } from '../../store/Cart'
import { useProductStore } from '../../store/Product.js'
import { useUserStore } from '../../store/User'
import { useLoadingStore } from '../../store/Loading'
import './CakeDetails.scss'

const CakeDetails = () => {
	const { productId } = useParams()
	const { products, fetchProducts } = useProductStore()
	const { addToCart } = useCartStore()
	const { token } = useUserStore()
	const { setLoading } = useLoadingStore()
	const navigate = useNavigate()

	const [selectedSize, setSelectedSize] = useState(null)
	const [quantity, setQuantity] = useState(1)
	const [error, setError] = useState(null)
	const [currentIngredients, setCurrentIngredients] = useState([])
	const [availableIngredients, setAvailableIngredients] = useState([])
	const [customizedPrice, setCustomizedPrice] = useState(0)

	useEffect(() => {
		const loadData = async () => {
			setLoading(true)
			try {
				if (!products || products.length === 0) await fetchProducts()
			} catch (err) {
				setError('Failed to load product')
				console.log(err)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [fetchProducts, products, setLoading])

	const product = products?.find(p => p._id === productId)

	// Debug: Check what product data looks like
	useEffect(() => {
		if (product) {
			console.log('Product data:', product)
			console.log('Product image path:', product.image)
			console.log('Product price:', product.price)
			console.log('Product sizes:', product.sizes)
		}
	}, [product])

	// Fix image URL function
	const getImageUrl = (imagePath) => {
		if (!imagePath) {
			console.log('No image path provided')
			return '/placeholder-image.jpg'
		}

		// If it's already a full URL, return as is
		if (imagePath.startsWith('http')) {
			console.log('Full URL detected:', imagePath)
			return imagePath
		}

		// If it starts with /, remove the leading slash to avoid double slashes
		if (imagePath.startsWith('/')) {
			const url = `${import.meta.env.VITE_API_URL}${imagePath}`
			console.log('Built URL:', url)
			return url
		}

		// Otherwise, assume it's relative to API
		const url = `${import.meta.env.VITE_API_URL}/${imagePath}`
		console.log('Relative path URL:', url)
		return url
	}

	// Inject mock data for ingredients and set initial state
	useEffect(() => {
		if (product) {
			const initialIngs = Array.isArray(product.ingredients)
				? product.ingredients.map((ing, idx) =>
					typeof ing === 'string'
						? { id: `ing-${idx}`, name: ing, price: 0 }
						: ing
				)
				: [
					{ id: 'base1', name: 'Basic Sponge', price: 0 },
					{ id: 'base2', name: 'Cream Frosting', price: 0 },
				]
			setCurrentIngredients(initialIngs)

			const availableIngs = [
				{ id: 'add1', name: 'Chocolate Drizzle', price: 50 },
				{ id: 'add2', name: 'Sprinkles', price: 30 },
				{ id: 'add3', name: 'Fresh Strawberries', price: 100 },
				{ id: 'add4', name: 'Edible Flowers', price: 150 },
			]
			setAvailableIngredients(availableIngs)

			// Initialize with base price
			setCustomizedPrice(product.price)
		}
	}, [product])

	// FIXED Price Calculation
	useEffect(() => {
		if (product) {
			console.log('Calculating price...')
			console.log('Base price:', product.price)
			console.log('Selected size:', selectedSize)
			console.log('Current ingredients:', currentIngredients)

			let totalPrice = product.price; // Start with base price

			// Add size price (not replace)
			if (selectedSize) {
				console.log('Size price to add:', selectedSize.price)
				totalPrice = product.price + selectedSize.price
			}

			// Add ingredients price
			const ingredientsPrice = currentIngredients.reduce(
				(sum, ing) => sum + ing.price,
				0
			)
			console.log('Ingredients price:', ingredientsPrice)

			totalPrice += ingredientsPrice
			console.log('Total calculated price:', totalPrice)

			setCustomizedPrice(totalPrice)
		}
	}, [currentIngredients, product, selectedSize])

	if (error) return <div>{error}</div>
	if (!product) return <div>Product not found</div>

	const handleRemoveIngredient = id => {
		setCurrentIngredients(currentIngredients.filter(ing => ing.id !== id))
	}

	const handleAddIngredient = ingredient => {
		if (!currentIngredients.some(ing => ing.id === ingredient.id)) {
			setCurrentIngredients([...currentIngredients, ingredient])
		}
	}

	const handleAddToCart = async () => {
		if (!token) {
			toast.error('Please log in to add items to your cart')
			return
		}
		if (product.sizes?.length && !selectedSize) {
			toast.error('Please select a size')
			return
		}
		const productToAdd = {
			...product,
			price: customizedPrice,
			customizedIngredients: currentIngredients,
			selectedSize,
		}
		try {
			await addToCart(productToAdd, token, quantity)
			toast.success('Added to cart!')
		} catch {
			toast.error('Failed to add to cart')
		}
	}

	const handleBuyNow = async () => {
		if (!token) {
			toast.error('Please log in to buy')
			return
		}
		if (product.sizes?.length && !selectedSize) {
			toast.error('Please select a size')
			return
		}
		const productToAdd = {
			...product,
			price: customizedPrice,
			customizedIngredients: currentIngredients,
			selectedSize,
		}
		try {
			await addToCart(productToAdd, token, quantity)
			navigate('/checkout')
		} catch {
			toast.error('Failed to start checkout')
		}
	}

	return (
		<main className='cake-details'>
			<div className='cake-details__container'>
				<div className='cake-details__images'>
					<img
						src={getImageUrl(product.image)}
						alt={product.name}
						onError={(e) => {
							console.error('Image failed to load:', e.target.src)
							e.target.src = '/placeholder-image.jpg'
							e.target.style.backgroundColor = '#f0f0f0'
						}}
						style={{
							maxWidth: '100%',
							height: 'auto',
							minHeight: '200px',
							backgroundColor: '#f9f9f9'
						}}
					/>
				</div>

				<div className='cake-details__info'>
					<h2>{product.name}</h2>
					<span className='rating'>
						<FaStar /> {product.rating?.average ?? 5} (
						{product.rating?.count ?? 0} reviews)
					</span>

					<Link to={`/bakers/${product.createdBy?._id}`}>
						by {product.createdBy?.name || 'Unknown Bakery'}
					</Link>

					<div className='cake-details__sizes'>
						<h4>Select Size:</h4>
						{product.sizes?.length > 0 ? (
							product.sizes.map(size => (
								<button
									key={size.label}
									className={selectedSize?.label === size.label ? 'active' : ''}
									onClick={() => {
										console.log('Size selected:', size)
										setSelectedSize(size)
									}}
								>
									{size.label} (+${size.price})
								</button>
							))
						) : (
							<p>No sizes available</p>
						)}
					</div>

					<div className='cake-details__quantity'>
						<label>Quantity:</label>
						<input
							type='number'
							min='1'
							value={quantity}
							onChange={e => setQuantity(Number(e.target.value))}
						/>
					</div>

					{/* Customization Section */}
					<div className='cake-details__customization'>
						<h3>Customize Your Cake:</h3>
						<div className='current-ingredients'>
							<h4>Current Ingredients:</h4>
							{currentIngredients.length === 0 ? (
								<p>No custom ingredients added.</p>
							) : (
								<ul>
									{currentIngredients.map(ing => (
										<li key={ing.id}>
											{ing.name} {ing.price > 0 && `(+${ing.price}₽)`}
											<button onClick={() => handleRemoveIngredient(ing.id)}>
												Remove
											</button>
										</li>
									))}
								</ul>
							)}
						</div>

						<div className='available-ingredients'>
							<h4>Available Ingredients:</h4>
							{availableIngredients.length === 0 ? (
								<p>No more ingredients to add.</p>
							) : (
								<ul>
									{availableIngredients.map(ing => (
										<li key={ing.id}>
											{ing.name} (+{ing.price}₽)
											<button onClick={() => handleAddIngredient(ing)}>
												Add
											</button>
										</li>
									))}
								</ul>
							)}
						</div>

						<p className='constructor-link-text'>
							<Link to='/constructor'>
								Still not what you want? Go to full Constructor page.
							</Link>
						</p>
					</div>

					<div className='cake-details__price'>
						<div><strong>Price Breakdown:</strong></div>
						<div>Base Price: ${product.price}</div>
						{selectedSize && (
							<div>Size: +${selectedSize.price}</div>
						)}
						{currentIngredients.some(ing => ing.price > 0) && (
							<div>Ingredients: +${currentIngredients.reduce((sum, ing) => sum + ing.price, 0)}</div>
						)}
						<div className='total-price'><strong>Total: ${customizedPrice}</strong></div>
					</div>

					<div className='cake-details__actions'>
						<button className='btn-primary' onClick={handleAddToCart}>
							<FaShoppingCart /> Add to Cart
						</button>
						<button className='btn-buy-now' onClick={handleBuyNow}>
							Buy Now
						</button>
					</div>

					{product.description && (
						<CakeAccordion title='Description'>
							<p>{product.description}</p>
						</CakeAccordion>
					)}
					{product.ingredients && (
						<CakeAccordion title='Ingredients'>
							<ul>
								{product.ingredients.map((ing, idx) => (
									<li key={idx}>{ing}</li>
								))}
							</ul>
						</CakeAccordion>
					)}
				</div>
			</div>
		</main>
	)
}

export default CakeDetails