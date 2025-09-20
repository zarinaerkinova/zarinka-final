import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/Cart'
import { useUserStore } from '../../store/User'
import './Custom.scss';

const Custom = () => {
	const { token } = useUserStore()
	const location = useLocation()
	const { addToCart } = useCartStore()

	const [sponge, setSponge] = useState('')
	const [cream, setCream] = useState('')
	const [decor, setDecor] = useState('')
	const [quantity, setQuantity] = useState(1)
	const [error, setError] = useState('')

	const sponges = ['Vanilla', 'Chocolate', 'Red Velvet']
	const creams = ['Buttercream', 'Cream Cheese', 'Ganache']
	const decors = ['Sprinkles', 'Berries', 'Chocolate Drips']

	const basePrice = 500 //! Цена кастомного торта

	// If navigated from a ready-made cake, prefill with its data
	useEffect(() => {
		const baseProduct = location.state?.baseProduct
		if (!baseProduct) return
		// Prefill from product.ingredients (could be strings or objects)
		const ingredients = Array.isArray(baseProduct.ingredients)
			? baseProduct.ingredients.map(ing =>
					typeof ing === 'string' ? { name: ing } : ing
			  )
			: []
		if (ingredients.length > 0) setSponge(ingredients[0]?.name || '')
		if (ingredients.length > 1) setCream(ingredients[1]?.name || '')
		if (ingredients.length > 2) setDecor(ingredients[2]?.name || '')
	}, [location.state])

	const handleAddToCart = async e => {
		e.preventDefault()
		if (!sponge || !cream || !decor) {
			setError('Please select all cake options.')
			return
		}
		if (!token) {
			setError('Please log in to add items to your cart.')
			return
		}
		setError('')

		const customizedIngredientsArray = [
			{ id: 'sponge', name: sponge, price: 0 },
			{ id: 'cream', name: cream, price: 0 },
			{ id: 'decor', name: decor, price: 0 },
		]

		const baseProduct = location.state?.baseProduct
		const customProduct = baseProduct
			? {
					// Keep original product so it remains a normal purchasable item
					...baseProduct,
					price: baseProduct.price, // keep base price; custom adds are zero-priced here
					selectedSize: baseProduct.selectedSize,
					customizedIngredients: customizedIngredientsArray,
			  }
			: {
					name: 'кастомный торт',
					price: basePrice,
					image: '/placeholder', // A placeholder image for custom cakes
					customizedIngredients: customizedIngredientsArray,
					baker: { name: 'индивидуальный заказ' },
			  }

		try {
			await addToCart(customProduct, token, quantity)
			toast.success('Added to cart!')
			setSponge('')
			setCream('')
			setDecor('')
			setQuantity(1)
		} catch (err) {
			setError('Failed to add to cart. Please try again.')
			console.error(err)
		}
	}

	return (
		<div className='custom-cake-page'>
			<h1>Create Your Custom Cake</h1>
			<form onSubmit={handleAddToCart} className='custom-cake-form'>
				<h2>Step 1: Choose Your Cake</h2>
				<div className='options-selection'>
					<div className='form-group'>
						<label>Sponge:</label>
						<div className='option-group'>
							{sponges.map(s => (
								<label key={s} className='option-item'>
									<input
										type='radio'
										name='sponge'
										value={s}
										checked={sponge === s}
										onChange={() => setSponge(s)}
									/>
									<span className='radio-checkmark'></span>
									<span className='option-text'>{s}</span>
								</label>
							))}
						</div>
					</div>

					<div className='form-group'>
						<label>Cream:</label>
						<div className='option-group'>
							{creams.map(c => (
								<label key={c} className='option-item'>
									<input
										type='radio'
										name='cream'
										value={c}
										checked={cream === c}
										onChange={() => setCream(c)}
									/>
									<span className='radio-checkmark'></span>
									<span className='option-text'>{c}</span>
								</label>
							))}
						</div>
					</div>

					<div className='form-group'>
						<label>Decoration:</label>
						<div className='option-group'>
							{decors.map(d => (
								<label key={d} className='option-item'>
									<input
										type='radio'
										name='decor'
										value={d}
										checked={decor === d}
										onChange={() => setDecor(d)}
									/>
									<span className='radio-checkmark'></span>
									<span className='option-text'>{d}</span>
								</label>
							))}
						</div>
					</div>
				</div>

				<h2>Step 2: Quantity and Price</h2>
				<div className='quantity-control'>
					<button
						type='button'
						onClick={() => setQuantity(q => Math.max(1, q - 1))}
					>
						-
					</button>
					<span>{quantity}</span>
					<button type='button' onClick={() => setQuantity(q => q + 1)}>
						+
					</button>
				</div>
				<div className='total-price-display'>
					<h3>Total: {basePrice * quantity} ₽</h3>
				</div>

				{error && <p className='error-message'>{error}</p>}

				<button type='submit' className='add-to-cart-btn'>
					Add to Cart
				</button>
			</form>
		</div>
	)
}

export default Custom
