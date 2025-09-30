import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import CheckoutProductCard from '../../components/CheckoutProductCard/CheckoutProductCard'
import { useOrderStore } from '../../store/Order'
import { useUserStore } from '../../store/User'
import { useCartStore } from '../../store/Cart' // Import useCartStore
import './Checkout.scss'

const Checkout = () => {
	const { token } = useUserStore()
	const placeOrder = useOrderStore(state => state.placeOrder)
	const navigate = useNavigate()
	const location = useLocation()

	const { cart, fetchCart, clearCart } = useCartStore() // GET CART AND FETCHCART FROM STORE

	const [deliveryMethod, setDeliveryMethod] = useState('delivery')
	const [paymentMethod, setPaymentMethod] = useState('card')
	const [deliveryInfo, setDeliveryInfo] = useState({
		name: '',
		phone: '',
		city: '',
		streetAddress: '',
		deliveryNotes: '',
	})
	const [specialInstructions, setSpecialInstructions] = useState('')

	useEffect(() => {
		if (token) {
			fetchCart(token); // Fetch the latest cart from the backend
		}
	}, [token, fetchCart]); // Depend on token and fetchCart

	const handleChange = e => {
		setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value })
	}

	const subtotal = cart.reduce((sum, item) => {
		const price = item.price ?? item.product?.price ?? 0
		return sum + price * item.quantity
	}, 0)

	const deliveryFee = deliveryMethod === 'delivery' ? (subtotal > 500 ? 0 : 500) : 0
	const total = subtotal + deliveryFee

	const handleOrder = async () => {
		if (deliveryMethod === 'delivery') {
			if (
				!deliveryInfo.name ||
				!deliveryInfo.phone ||
				!deliveryInfo.city ||
				!deliveryInfo.streetAddress
			) {
				toast.error('Please fill all delivery information fields')
				return
			}
		} else {
			// pickup
			if (!deliveryInfo.name || !deliveryInfo.phone) {
				toast.error('Please enter your name and phone for pickup')
				return
			}
		}

		const orderData = {
			items: cart.map(item => {
				if (item.product?._id) {
					// Regular product
					return {
						product: item.product._id,
                        price: item.price, // <-- ADDED
						quantity: item.quantity,
						selectedSize: item.selectedSize,
						customizedIngredients: item.customizedIngredients, // <-- ADDED
					};
				} else {
					// Custom cake
					return {
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						selectedSize: item.selectedSize,
						customizedIngredients: item.customizedIngredients,
					};
				}
			}),
			totalPrice: total,
			deliveryMethod,
			paymentMethod,
			deliveryInfo:
				deliveryMethod === 'delivery'
					? deliveryInfo
					: { name: deliveryInfo.name, phone: deliveryInfo.phone },
			specialInstructions,
		}

		try {
			await placeOrder(token, orderData)
			toast.success('Order placed!')
			clearCart(); // Clear the cart after successful order
			navigate('/my-orders')
		} catch (err) {
			toast.error(err.response?.data?.message || err.message || 'Order failed')
		}
	}

	return (
		<div className='checkout-page'>
			<div className='checkout-form-section'>
				<h2>Delivery Method</h2>
				<div className='radio-group'>
					<label>
						<input
							type='radio'
							value='delivery'
							checked={deliveryMethod === 'delivery'}
							onChange={e => setDeliveryMethod(e.target.value)}

						/>{' '}
						Delivered to your address
					</label>
					<label>
						<input
							type='radio'
							value='pickup'
							checked={deliveryMethod === 'pickup'}
							onChange={e => setDeliveryMethod(e.target.value)}
						/>{' '}
						Pickup
					</label>
				</div>

				{deliveryMethod === 'delivery' && (
					<>
						<h2>Delivery Information</h2>
						<div className='form-grid'>
							<input
								name='name'
								placeholder='Full Name'
								value={deliveryInfo.name}
								onChange={handleChange}
								required
							/>
							<input
								name='phone'
								placeholder='Phone Number'
								value={deliveryInfo.phone}
								onChange={handleChange}
								required
							/>
							<input
								name='city'
								placeholder='City'
								onChange={handleChange}
								required
							/>
							<input
								name='streetAddress'
								placeholder='Street Address'
								value={deliveryInfo.streetAddress}
								onChange={handleChange}
								required
							/>
							<textarea
								name='deliveryNotes'
								placeholder='Delivery Notes'
								value={deliveryInfo.deliveryNotes}
								onChange={handleChange}
							></textarea>
						</div>
					</>
				)}

				{deliveryMethod === 'pickup' && (
					<>
						<h2>Pickup Information</h2>
						<div className='form-grid'>
							<input
								name='name'
								placeholder='Full Name'
								value={deliveryInfo.name}
								onChange={handleChange}
								required
							/>
							<input
								name='phone'
								placeholder='Phone Number'
								value={deliveryInfo.phone}
								onChange={handleChange}
								required
							/>
						</div>
					</>
				)}

				<h2>Payment Option</h2>
				<div className='radio-group'>
					<label>
						<input
							type='radio'
							value='card'
							checked={paymentMethod === 'card'}
							onChange={e => setPaymentMethod(e.target.value)}
						/>{' '}
						Card
					</label>
					<label>
						<input
							type='radio'
							value='cash'
							checked={paymentMethod === 'cash'}
							onChange={e => setPaymentMethod(e.target.value)}
						/>{' '}
						Cash
					</label>
				</div>

				<h2>Special Instructions</h2>
				<textarea
					placeholder='Any special instructions for your order?'
					value={specialInstructions}
					onChange={e => setSpecialInstructions(e.target.value)}
				></textarea>
			</div>
			<div className='checkout-summary-section'>
				<h2>Order Summary</h2>
				<div className='summary-product-list'>
					{cart.map(item => (
						<CheckoutProductCard key={item.product?._id || item._id} item={item} />
					))}
				</div>
				<div className='summary-costs'>
					<div className='cost-item'>
						<span>Subtotal</span>
						<span>{subtotal} ₽</span>
					</div>
					          <div className='cost-item'>
					            <span>Delivery Fee</span>
					            {deliveryFee === 0 ? (
					              <span className='free-delivery'>FREE</span>
					            ) : (
					              <span>{deliveryFee} ₽</span>
					            )}
					          </div>
					          <div className='cost-item total'>
					            <span>Total</span>
					            <span>{total} ₽</span>
					          </div>
					        </div>
					        <button className='place-order-btn' onClick={handleOrder}>
					          Place Order
					        </button>
					      </div>
					      <style>
					        {`
					          .free-delivery {
					            color: green;
					            font-weight: bold;
					          }
					        `}
					      </style>
					    </div>
					  )
					}
export default Checkout