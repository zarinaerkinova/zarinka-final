import React, { useEffect } from 'react'
import { RiShoppingBag3Line } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import CartItem from '../../components/CartItem'
import { useCartStore } from '../../store/Cart'
import { useUserStore } from '../../store/User'
import { useLoadingStore } from '../../store/Loading' // Import useLoadingStore
import './Cart.scss'

import { useTranslation } from 'react-i18next';

const Cart = () => {
	const { t } = useTranslation();
	const { cart, fetchCart } = useCartStore()
	const { token } = useUserStore()
	const { setLoading } = useLoadingStore() // Get setLoading from global store
	const navigate = useNavigate()

	useEffect(() => {
		const loadCart = async () => {
			setLoading(true) // Set global loading to true
			try {
				if (token) await fetchCart(token)
			} catch (error) {
				console.error("Failed to fetch cart:", error)
			} finally {
				setLoading(false) // Set global loading to false
			}
		}
		loadCart()
	}, [token, fetchCart, setLoading])

	if (!cart || cart.length === 0) {
		return (
			<div className='container'>
				<div className='cart-page'>
					<h1 className='cart_h1'>{t('cart_page_your_cart')}</h1>
					<div className='empty'>
						<RiShoppingBag3Line className='shop_icon' />
						<h3>{t('cart_page_empty_cart')}</h3>
						<p>
							{t('cart_page_empty_cart_subtitle')}
						</p>
						<div className='btns'>
							<Link to={'/custom'} className='build'>
								{t('cart_page_build_custom_cake')}
							</Link>
							<Link to={'/cakes'} className='browse'>
								{t('cart_page_browse_ready_made')}
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Calculate total using selected size if present
	const total = cart.reduce((sum, item) => {
		const price = item.price ?? item.product?.price ?? 0
		return sum + price * item.quantity
	}, 0)
	const deliveryPrice = total > 500 ? 0 : 500 // Placeholder for delivery price

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
					<h2>{t('cart_page_order_summary')}</h2>
					<div className='summary-items'>
						{cart.map(item => (
							<div className='summary-item' key={item._id ?? item.cartItemId}>
								<span>
									{item.product?.name || item.name} (x{item.quantity})
								</span>
								<span>
									{(item.price ?? item.product?.price ?? 0) * item.quantity}{' '}
									₽
								</span>
							</div>
						))}
					</div>
					<div className='summary-delivery'>
						<span>{t('cart_page_delivery')}</span>
						{deliveryPrice === 0 ? (
							<span className='free-delivery'>{t('cart_page_free')}</span>
						) : (
							<span>{deliveryPrice} ₽</span>
						)}
					</div>
					<div className='summary-total'>
						<span>{t('cart_page_total')}</span>
						<span>{total + deliveryPrice} ₽</span>
					</div>
					<button className='checkout-btn' onClick={handleCheckout}>
						{t('cart_page_proceed_to_checkout')}
					</button>
					<Link to='/cakes' className='continue-shopping'>
						{t('cart_page_continue_shopping')}
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Cart
