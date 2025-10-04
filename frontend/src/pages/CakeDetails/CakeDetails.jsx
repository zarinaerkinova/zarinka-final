import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaShoppingCart, FaStar } from 'react-icons/fa'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CakeAccordion from '../../components/CakeAccordion.jsx'
import { useCartStore } from '../../store/Cart'
import { useProductStore } from '../../store/Product.js'
import { useUserStore } from '../../store/User'
import { useLoadingStore } from '../../store/Loading' // Import useLoadingStore
import './CakeDetails.scss'

const CakeDetails = () => {
	const { productId } = useParams()
	const { products, fetchProducts } = useProductStore()
	const { addToCart } = useCartStore()
	const { token } = useUserStore()
	const { setLoading } = useLoadingStore() // Get setLoading from global store
	const navigate = useNavigate()

	const [selectedSize, setSelectedSize] = useState(null)
	const [quantity, setQuantity] = useState(1)
	const [error, setError] = useState(null)

	// New state for customization
	const [currentIngredients, setCurrentIngredients] = useState([])
	const [availableIngredients, setAvailableIngredients] = useState([])
	const [customizedPrice, setCustomizedPrice] = useState(0)

	useEffect(() => {
		const loadData = async () => {
			setLoading(true) // Set global loading to true
			try {
				if (!products || products.length === 0) await fetchProducts()
			} catch (err) {
				setError('Failed to load product')
				console.log(err)
			} finally {
				setLoading(false) // Set global loading to false
			}
		}
		loadData()
	}, [fetchProducts, products, setLoading])

	const product = products?.find(p => p._id === productId)

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
		}
	}, [product])

	// Calculate customized price
	useEffect(() => {
		if (product) {
			const basePrice = product.price
			const sizePrice = selectedSize ? selectedSize.price : 0
			const ingredientsPrice = currentIngredients.reduce(
				(sum, ing) => sum + ing.price,
				0
			)
			setCustomizedPrice(basePrice + sizePrice + ingredientsPrice)
		}
	}, [currentIngredients, product, selectedSize, quantity])

	if (error) return <div>{error}</div>
	if (!product) return <div>Product not found</div>

	const handleRemoveIngredient = ingredientId => {
		const ingredientToRemove = currentIngredients.find(
			ing => ing.id === ingredientId
		)
		if (ingredientToRemove) {
			setCurrentIngredients(
				currentIngredients.filter(ing => ing.id !== ingredientId)
			)
			setAvailableIngredients([...availableIngredients, ingredientToRemove])
		}
	}

	const handleAddIngredient = ingredient => {
		if (!currentIngredients.some(ing => ing.id === ingredient.id)) {
			setCurrentIngredients([...currentIngredients, ingredient])
			setAvailableIngredients(
				availableIngredients.filter(ing => ing.id !== ingredient.id)
			)
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
		console.log('Customized Price:', customizedPrice)
		const productToAdd = {
			...product,
			price: customizedPrice, // Use customized price
			customizedIngredients: currentIngredients, // Add customized ingredients
			selectedSize,
		}
		console.log('Product to add to cart:', productToAdd)
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

	// Removed unused handlers to satisfy linter

	return (
		<main className='cake-details'>
			<div className='cake-details__container'>
				<div className='cake-details__images'>
					{product.image ? (
						<img
							src={product.image}
							alt={product.name || 'Baker'}
							className='profile-image'
						/>
					) : (
						<div className='profile-initials'>
							{product.name?.charAt(0) ||
								product.bakeryName?.charAt(0) ||
								'B'}
						</div>
					)}
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
						{product.sizes?.map(size => (
							<button
								key={size.label}
								className={selectedSize?.label === size.label ? 'active' : ''}
								onClick={() => setSelectedSize(size)}
							>
								{size.label} ({size.price} UZS)
							</button>
						))}
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
											{ing.name} (+{ing.price}₽)
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
						Price: {customizedPrice} UZS
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
