import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/Cart'
import { useUserStore } from '../../store/User'
import { ChefHat, ShoppingCart, Plus, Minus } from 'lucide-react'
import "./Custom.scss"

const Custom = () => {
	const { token } = useUserStore()
	const location = useLocation()
	const { addToCart } = useCartStore()

	const [decor, setDecor] = useState('')
	const [quantity, setQuantity] = useState(1)
	const [error, setError] = useState('')

	const sponges = [
		{ name: 'Vanilla', price: 0 },
		{ name: 'Chocolate', price: 0 },
		{ name: 'Strawberry', price: 5 },
		{ name: 'Red Velvet', price: 8 },
		{ name: 'Lemon', price: 5 },
		{ name: 'Carrot', price: 10 },
	]
	const [sponge, setSponge] = useState(sponges[0])

	const creams = [
		{ name: 'Buttercream', price: 0 },
		{ name: 'Cream Cheese', price: 5 },
		{ name: 'Fondant', price: 15 },
		{ name: 'Whipped Cream', price: 3 },
	]
	const [cream, setCream] = useState(creams[0])

	const decors = ['Sprinkles', 'Berries', 'Chocolate Drips']

	const sizes = [
		{ name: 'Small', description: '6 inch, serves 8-10', price: 0 },
		{ name: 'Medium', description: '8 inch, serves 12-15', price: 15 },
		{ name: 'Large', description: '10 inch, serves 20-25', price: 30 },
		{ name: 'Extra Large', description: '12 inch, serves 30-35', price: 50 },
	]
	const [size, setSize] = useState(sizes[0])

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
		if (ingredients.length > 0) {
			const prefillSponge = sponges.find(s => s.name === ingredients[0]?.name)
			if (prefillSponge) {
				setSponge(prefillSponge)
			}
		}
		if (ingredients.length > 1) {
			const prefillCream = creams.find(c => c.name === ingredients[1]?.name)
			if (prefillCream) {
				setCream(prefillCream)
			}
		}
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
			{ id: 'sponge', name: sponge.name, price: sponge.price },
			{ id: 'cream', name: cream.name, price: cream.price },
			{ id: 'decor', name: decor, price: 0 },
		]

		const baseProduct = location.state?.baseProduct
		const customProduct = baseProduct
			? {
					// Keep original product so it remains a normal purchasable item
					...baseProduct,
					price: baseProduct.price + size.price + sponge.price + cream.price,
					selectedSize: size.name,
					customizedIngredients: customizedIngredientsArray,
			  }
			: {
					name: 'кастомный торт',
					price: basePrice + size.price + sponge.price + cream.price,
					image: '/placeholder', // A placeholder image for custom cakes
					customizedIngredients: customizedIngredientsArray,
					baker: { name: 'индивидуальный заказ' },
					selectedSize: size.name,
			  }

		try {
			await addToCart(customProduct, token, quantity)
			toast.success('Added to cart!')
			setSponge(sponges[0])
			setCream(creams[0])
			setDecor('')
			setQuantity(1)
		} catch (err) {
			setError('Failed to add to cart. Please try again.')
			console.error(err)
		}
	}

	return (
		<div className="custom-cake-constructor">
			<div className="container">
				{/* Header */}
				<div className="header">
					<h1>Cake Constructor</h1>
					<p>Design your perfect custom cake</p>
				</div>

				<div className="main-grid">
					{/* Configuration Panel */}
					<div className="config-panel">
						<form onSubmit={handleAddToCart}>
							{/* Choose Flavor */}
							<div className="config-section">
								<h3 className="section-title">Choose Flavor</h3>
								<div className="option-grid two-cols">
									{sponges.map(s => (
										<label key={s.name} className="option-item">
											<input
												type="radio"
												name="sponge"
												value={s.name}
												checked={sponge.name === s.name}
												onChange={() => setSponge(s)}
												className="option-input"
											/>
											<div className="option-label">
												<div className="option-text">{s.name} {s.price > 0 && `(+${s.price} ₽)`}</div>
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Choose Size */}
							<div className="config-section">
								<h3 className="section-title">Choose Size</h3>
								<div className="option-grid two-cols">
									{sizes.map(s => (
										<label key={s.name} className="option-item">
											<input
												type="radio"
												name="size"
												value={s.name}
												checked={size.name === s.name}
												onChange={() => setSize(s)}
												className="option-input"
											/>
											<div className="option-label">
												<div style={{display: 'flex', flexDirection: 'column'}}>
													<span>{s.name} {s.price > 0 && `(+${s.price} ₽)`}</span>
													<small style={{ opacity: 0.7, fontWeight: 'normal' }}>{s.description}</small>
												</div>
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Choose Frosting */}
							<div className="config-section">
								<h3 className="section-title">Choose Frosting</h3>
								<div className="option-grid three-cols">
									{creams.map(c => (
										<label key={c.name} className="option-item">
											<input
												type="radio"
												name="cream"
												value={c.name}
												checked={cream.name === c.name}
												onChange={() => setCream(c)}
												className="option-input"
											/>
											<div className="option-label advanced">
												<span className="option-text">{c.name} {c.price > 0 && `(+${c.price} ₽)`}</span>
												<div className="option-indicator">
													<div className="option-indicator-inner"></div>
												</div>
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Choose Decorations */}
							<div className="config-section">
								<h3 className="section-title">Choose Decorations (Optional)</h3>
								<div className="option-grid three-cols">
									{decors.map(d => (
										<label key={d} className="option-item">
											<input
												type="radio"
												name="decor"
												value={d}
												checked={decor === d}
												onChange={() => setDecor(d)}
												className="option-input"
											/>
											<div className="option-label advanced">
												<span className="option-text">{d}</span>
												<div className="option-indicator square">
													<svg className="checkmark-icon" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
													</svg>
												</div>
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Custom Message */}
							<div className="config-section">
								<h3 className="section-title">Custom Message (Optional)</h3>
								<div className="input-group">
									<label className="input-label">
										Message on cake
									</label>
									<input
										type="text"
										placeholder="e.g., Happy Birthday Sarah!"
										maxLength={50}
										className="text-input"
									/>
									<div className="character-count">0/50 characters</div>
								</div>
							</div>

							{/* Special Instructions */}
							<div className="config-section">
								<h3 className="section-title">Special Instructions (Optional)</h3>
								<div className="input-group">
									<label className="input-label">
										Additional requests
									</label>
									<textarea
										placeholder="Any special requests or dietary requirements..."
										rows={4}
										className="textarea-input"
									/>
								</div>
							</div>
						</form>
					</div>

					{/* Order Summary */}
					<div className="order-summary">
						<h3 className="summary-title">Order Summary</h3>
						
						{/* Cake Icon */}
						<div className="cake-icon-container">
							<div className="cake-icon">
								<ChefHat />
							</div>
						</div>
						
						<div className="cake-title">
							<h4>Custom Cake</h4>
						</div>

						{/* Quantity */}
						<div className="quantity-control">
							<span className="quantity-label">Quantity</span>
							<div className="quantity-buttons">
								<button
									type="button"
									onClick={() => setQuantity(q => Math.max(1, q - 1))}
									className="quantity-btn"
								>
									<Minus />
								</button>
								<span className="quantity-value">{quantity}</span>
								<button 
									type="button" 
									onClick={() => setQuantity(q => q + 1)}
									className="quantity-btn"
								>
									<Plus />
								</button>
							</div>
						</div>

						{/* Price Breakdown */}
						<div className="price-breakdown">
							<div className="price-item">
								<span className="price-label">Base Price</span>
								<span className="price-value">{basePrice} ₽</span>
							</div>
							{sponge.price > 0 && (
								<div className="price-item">
									<span className="price-label">{sponge.name} Flavor</span>
									<span className="price-value">+{sponge.price} ₽</span>
								</div>
							)}
							{size.price > 0 && (
								<div className="price-item">
									<span className="price-label">{size.name} Size</span>
									<span className="price-value">+{size.price} ₽</span>
								</div>
							)}
							{cream.price > 0 && (
								<div className="price-item">
									<span className="price-label">{cream.name} Frosting</span>
									<span className="price-value">+{cream.price} ₽</span>
								</div>
							)}
							<div className="price-divider"></div>
							<div className="total-price">
								<span>Total</span>
								<span className="total-amount">{(basePrice + size.price + sponge.price + cream.price) * quantity} ₽</span>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="error-message">
								<p className="error-text">{error}</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="action-buttons">
							<button 
								onClick={handleAddToCart}
								className="btn btn-secondary"
							>
								<ShoppingCart />
								<span>Add to Cart</span>
							</button>
							<button className="btn btn-primary">
								Place Order
							</button>
						</div>

						{/* Note */}
						<p className="preparation-note">
							Custom cakes require 3-7 days preparation time
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Custom