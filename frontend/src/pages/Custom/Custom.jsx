import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/Cart'
import { useUserStore } from '../../store/User'
import { ChefHat, ShoppingCart, Plus, Minus } from 'lucide-react'
import "./Custom.scss"

import { useTranslation } from 'react-i18next';

const Custom = () => {
	const { t } = useTranslation();
	const { token } = useUserStore()
	const location = useLocation()
	const { addToCart } = useCartStore()

	const [decor, setDecor] = useState(null)
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

	const decorsOptions = [
		{ name: 'Sprinkles', price: 0 },
		{ name: 'Berries', price: 0 },
		{ name: 'Chocolate Drips', price: 0 },
		{ name: 'Fresh Flowers', price: 20 },
		{ name: 'Sugar Flowers', price: 35 },
		{ name: 'Chocolate Drip', price: 15 },
		{ name: 'Gold Accents', price: 25 },
		{ name: 'Custom Cake Topper', price: 40 },
		{ name: 'Piped Buttercream Roses', price: 18 },
	]
	const [selectedDecor, setSelectedDecor] = useState(decorsOptions[0])

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
		if (ingredients.length > 2) {
			const prefillDecor = decorsOptions.find(d => d.name === ingredients[2]?.name)
			if (prefillDecor) {
				setSelectedDecor(prefillDecor)
			}
		}
	}, [location.state])

	const handleAddToCart = async e => {
		e.preventDefault()
		if (!sponge || !cream || !selectedDecor) {
			setError(t('custom_error_select_all') || 'Please select all cake options.')
			return
		}
		if (!token) {
			setError(t('custom_error_login') || 'Please log in to add items to your cart.')
			return
		}
		setError('')

		const customizedIngredientsArray = [
			{ id: 'sponge', name: sponge.name, price: sponge.price },
			{ id: 'cream', name: cream.name, price: cream.price },
			{ id: 'decor', name: selectedDecor.name, price: selectedDecor.price },
		]

		const baseProduct = location.state?.baseProduct
		const customProduct = baseProduct
			? {
					// Keep original product so it remains a normal purchasable item
					...baseProduct,
					price: baseProduct.price + size.price + sponge.price + cream.price + selectedDecor.price,
					selectedSize: size,
					customizedIngredients: customizedIngredientsArray,
			  }
			: {
					name: t('custom_cake_name') || 'кастомный торт',
					price: basePrice + size.price + sponge.price + cream.price + selectedDecor.price,
					image: '../../assets/CustomCake.png', // A placeholder image for custom cakes
					customizedIngredients: customizedIngredientsArray,
					baker: { name: t('custom_baker_name') || 'индивидуальный заказ' },
					selectedSize: size,
			  }

		try {
			await addToCart(customProduct, token, quantity)
			toast.success(t('custom_success_added') || 'Added to cart!')
			setSponge(sponges[0])
			setCream(creams[0])
			setSelectedDecor(decorsOptions[0])
			setQuantity(1)
		} catch (err) {
			setError(t('custom_error_failed') || 'Failed to add to cart. Please try again.')
			console.error(err)
		}
	}

	return (
		<div className="custom-cake-constructor">
			<div className="container">
				{/* Header */}
				<div className="header">
					<h1>{t('custom_page_title')}</h1>
					<p>{t('custom_page_subtitle')}</p>
				</div>

				<div className="main-grid">
					{/* Configuration Panel */}
					<div className="config-panel">
						<form onSubmit={handleAddToCart}>
							{/* Choose Flavor */}
							<div className="config-section">
								<h3 className="section-title">{t('custom_page_choose_flavor')}</h3>
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
												<div className="option-text">{t('custom_page_' + s.name.toLowerCase().replace(' ', '_'))} {s.price > 0 && `(+${s.price} ₽)`}</div>
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Choose Size */}
							<div className="config-section">
								<h3 className="section-title">{t('custom_page_choose_size')}</h3>
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
													<span>{t('custom_page_' + s.name.toLowerCase().replace(' ', '_'))} {s.price > 0 && `(+${s.price} ₽)`}</span>
													<small style={{ opacity: 0.7, fontWeight: 'normal' }}>{t('custom_page_' + s.name.toLowerCase().replace(' ', '_') + '_serves')}</small>
												</div>
											</div>
										</label>
									))}
								</div>
							</div>

							{/* Choose Frosting */}
							<div className="config-section">
								<h3 className="section-title">{t('custom_page_choose_frosting')}</h3>
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
												<span className="option-text">{t('custom_page_' + c.name.toLowerCase().replace(' ', '_'))} {c.price > 0 && `(+${c.price} ₽)`}</span>
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
								<h3 className="section-title">{t('custom_page_choose_decorations')}</h3>
								<div className="option-grid three-cols">
									{decorsOptions.map(d => (
										<label key={d.name} className="option-item">
											<input
												type="radio"
												name="decor"
												value={d.name}
												checked={selectedDecor?.name === d.name}
												onChange={() => setSelectedDecor(d)}
												className="option-input"
											/>
											<div className="option-label advanced">
												<span className="option-text">{t('custom_page_' + d.name.toLowerCase().replace(/\s/g, '_'))} {d.price > 0 && `(+${d.price} ₽)`}</span>
												<div className="option-indicator">
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
								<h3 className="section-title">{t('custom_page_custom_message')}</h3>
								<div className="input-group">
									<label className="input-label">
										{t('custom_page_message_on_cake')}
									</label>
									<input
										type="text"
										placeholder={t('custom_page_message_placeholder')}
										maxLength={50}
										className="text-input"
									/>
									<div className="character-count">{t('custom_page_character_count')}</div>
								</div>
							</div>

							{/* Special Instructions */}
							<div className="config-section">
								<h3 className="section-title">{t('custom_page_special_instructions')}</h3>
								<div className="input-group">
									<label className="input-label">
										{t('custom_page_additional_requests')}
									</label>
									<textarea
										placeholder={t('custom_page_requests_placeholder')}
										rows={4}
										className="textarea-input"
									/>
								</div>
							</div>
						</form>
					</div>

					{/* Order Summary */}
					<div className="order-summary">
						<h3 className="summary-title">{t('custom_page_order_summary')}</h3>
						
						{/* Cake Icon */}
						<div className="cake-icon-container">
							<div className="cake-icon">
								<ChefHat />
							</div>
						</div>
						
						<div className="cake-title">
							<h4>{t('custom_page_custom_cake')}</h4>
						</div>

						{/* Quantity */}
						<div className="quantity-control">
							<span className="quantity-label">{t('custom_page_quantity')}</span>
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
								<span className="price-label">{t('custom_page_base_price')}</span>
								<span className="price-value">{basePrice} ₽</span>
							</div>
							{sponge.price > 0 && (
								<div className="price-item">
									<span className="price-label">{t('custom_page_' + sponge.name.toLowerCase().replace(' ', '_'))} {t('custom_page_flavor')}</span>
									<span className="price-value">+{sponge.price} ₽</span>
								</div>
							)}
							{size.price > 0 && (
								<div className="price-item">
									<span className="price-label">{t('custom_page_' + size.name.toLowerCase().replace(' ', '_'))} {t('custom_page_size')}</span>
									<span className="price-value">+{size.price} ₽</span>
								</div>
							)}
							{cream.price > 0 && (
								<div className="price-item">
									<span className="price-label">{t('custom_page_' + cream.name.toLowerCase().replace(' ', '_'))} {t('custom_page_frosting')}</span>
									<span className="price-value">+{cream.price} ₽</span>
								</div>
							)}
							{selectedDecor?.price > 0 && (
								<div className="price-item">
									<span className="price-label">{t('custom_page_' + selectedDecor.name.toLowerCase().replace(/\s/g, '_'))}</span>
									<span className="price-value">+{selectedDecor.price} ₽</span>
								</div>
							)}
							<div className="price-divider"></div>
							<div className="total-price">
								<span>{t('custom_page_total')}</span>
								<span className="total-amount">{(basePrice + size.price + sponge.price + cream.price + selectedDecor.price) * quantity} ₽</span>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="error-message">
								<p className="error-text">{t(error)}</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="action-buttons">
							<button 
								onClick={handleAddToCart}
								className="btn btn-secondary"
							>
								<ShoppingCart />
								<span>{t('custom_page_add_to_cart')}</span>
							</button>
							<button className="btn btn-primary">
								{t('custom_page_place_order')}
							</button>
						</div>

						{/* Note */}
						<p className="preparation-note">
							{t('custom_page_preparation_time')}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Custom