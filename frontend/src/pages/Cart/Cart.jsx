import React, { useEffect, useState } from 'react'
import { RiShoppingBag3Line } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import CartItem from '../../components/CartItem'
import { useCartStore } from '../../store/Cart'
import { useUserStore } from '../../store/User'
import './Cart.scss'

const Cart = () => {
	const { cart, fetchCart } = useCartStore()
	const { token } = useUserStore()
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		const loadCart = async () => {
			if (token) await fetchCart(token)
			setLoading(false)
		}
		loadCart()
	}, [token, fetchCart])

	if (loading) return <div className='container'>Loading cart...</div>

	if (!cart || cart.length === 0) {
		return (
			<div className='container'>
				<div className='cart-page'>
					<h1 className='cart_h1'>Your Cart</h1>
					<div className='empty'>
						<RiShoppingBag3Line className='shop_icon' />
						<h3>Your cart is empty</h3>
						<p>
							Start building your perfect cake or browse our ready-made options
						</p>
						<div className='btns'>
							<Link to={'/custom'} className='build'>
								Build Custom Cake
							</Link>
							<Link to={'/cakes'} className='browse'>
								Browse Ready Made
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Calculate total using selected size if present
	const total = cart.reduce((sum, item) => {
		const price =
			item.selectedSize?.price ?? item.product?.price ?? item.price ?? 0
		return sum + price * item.quantity
	}, 0)
	const deliveryPrice = 500 // Placeholder for delivery price

	const handleCheckout = () => {
		navigate('/checkout', { state: { cart } })
	}

	return (
		<div className='container'>
			<div className='cart-page'>
				<h1 className='cart_h1'>Your Cart</h1>
				{cart.map(item => (
					<CartItem key={item._id ?? item.cartItemId} item={item} />
				))}
				<div className='order-summary'>
					<h2>Order Summary</h2>
					<div className='summary-items'>
						{cart.map(item => (
							<div className='summary-item' key={item._id ?? item.cartItemId}>
								<span>
									{item.product?.name || item.name} (x{item.quantity})
								</span>
								<span>
									{(item.selectedSize?.price ??
										item.product?.price ??
										item.price ??
										0) * item.quantity}{' '}
									₽
								</span>
							</div>
						))}
					</div>
					<div className='summary-delivery'>
						<span>Delivery</span>
						<span>{deliveryPrice} ₽</span>
					</div>
					<div className='summary-total'>
						<span>Total</span>
						<span>{total + deliveryPrice} ₽</span>
					</div>
					<button className='checkout-btn' onClick={handleCheckout}>
						Proceed to Checkout
					</button>
					<Link to='/cakes' className='continue-shopping'>
						Continue Shopping
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Cart
