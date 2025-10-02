import React, { useState } from 'react'
import { useCartStore } from '../store/Cart.js'
import { useUserStore } from '../store/User.js'
import './CartItem.scss'
import IngredientsTooltip from './IngredientsTooltip/IngredientsTooltip.jsx'

const CartItem = ({ item }) => {
	const { removeFromCart, updateQuantity } = useCartStore()
	const { token } = useUserStore()
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)

	if (!item || (!item.product && !item.name)) return null

	const handleDecrease = () => {
		if (!token) return
		const cartId = item._id ?? item.cartItemId
		if (item.quantity > 1) {
			updateQuantity(cartId, item.quantity - 1, token)
		} else if (item.quantity === 1) {
			removeFromCart(cartId, token)
		}
	}

	const handleIncrease = () => {
		if (!token) return
		const cartId = item._id ?? item.cartItemId
		updateQuantity(cartId, item.quantity + 1, token)
	}

	const handleRemove = () => {
		const cartId = item._id ?? item.cartItemId
		removeFromCart(cartId, token)
	}

	const ingredientsForTooltip =
		item.customizedIngredients ??
		item.product?.customizedIngredients ??
		item.product?.ingredients ??
		[]
	const price = item.price ?? item.product?.price

	const imageSrc = (() => {
		const img = item.product?.image ?? item.image
		if (!img) return '/placeholder.png'
		if (typeof img === 'string' && img.startsWith('/uploads'))
			return `${import.meta.env.VITE_BACKEND_BASE_URL}${img}`
		return img
	})()

	return (
		<div
			className='cart-item'
			onMouseEnter={() => setIsTooltipVisible(true)}
			onMouseLeave={() => setIsTooltipVisible(false)}
		>
			<img
				src={imageSrc}
				alt={item.product?.name || item.name}
				className='cart-item-img'
			/>
			<div className='cart-item-info'>
				<div className='texts'>
					<h3 className='product-name'>{item.product?.name || item.name}</h3>
					<p>Изготовитель: {item.product?.baker?.name || 'Custom order'}</p>
					{item.selectedSize && (
						<p>Size: {item.selectedSize.label}</p>
					)}
					<span>{price} ₽ / each</span>
				</div>

				<div className='quantity-calculator'>
					<button onClick={handleDecrease}>-</button>
					<span>{item.quantity}</span>
					<button onClick={handleIncrease}>+</button>
				</div>

				<button className='remove-btn' onClick={handleRemove}>
					Remove
				</button>
			</div>
		</div>
	)
}

export default CartItem