import React, { useEffect, useRef, useState } from 'react'
import {
	FaBoxOpen,
	FaCog,
	FaQuestionCircle,
	FaRegHeart,
	FaRegUser,
	FaSearch,
	FaSignInAlt,
	FaSignOutAlt,
	FaUserCircle,
} from 'react-icons/fa'
import { IoCartOutline } from 'react-icons/io5'
import { Link, NavLink } from 'react-router-dom'
import useOutsideAlerter from '../../hooks/useOutsideAlerter'
import { useUserStore } from '../../store/User.js'
import NotificationDropdown from '../NotificationDropdown.jsx'
import './Navbar.css'
import logo from '/Zarinka_logo.svg'

const Navbar = () => {
	const { user, token, setUserData, logoutUser } = useUserStore()
	const [showDropdown, setShowDropdown] = useState(false)
	const dropdownRef = useRef(null)
	useOutsideAlerter(dropdownRef, () => setShowDropdown(false))

	useEffect(() => {
		const storedUser = localStorage.getItem('user')
		const storedToken = localStorage.getItem('token')
		if (
			storedUser &&
			storedUser !== 'undefined' &&
			storedToken &&
			!user &&
			!token
		) {
			try {
				setUserData({
					user: JSON.parse(storedUser),
					token: storedToken,
				})
			} catch {
				localStorage.removeItem('user')
			}
		}
	}, [user, token, setUserData])

	const handleDropdownToggle = () => {
		setShowDropdown(!showDropdown)
	}

	const handleMenuItemClick = () => {
		setShowDropdown(false)
	}

	return (
		<nav className='mainNav'>
			<div className='container'>
				<div className='block'>
					<Link to='/'>
						<img className='logo' src={logo} alt='Zarinka logo' />
					</Link>

					<form className='menu-header'>
						<NavLink to='/cakes'>Browse Cakes</NavLink>
						<NavLink to='/bakers'>Find Bakers</NavLink>
						<NavLink to='/custom'>Custom cakes</NavLink>
						<NavLink to='/contact'>Contact</NavLink>
						<NavLink to='/help'>Help</NavLink>
					</form>
				</div>

				<div className='icons'>
					{token && user && (
						<>
							<Link className='cart-icon' to='/cart'>
								<IoCartOutline />
							</Link>
							<Link className='favorite' to={'/favorite'}>
								<FaRegHeart />
							</Link>
						</>
					)}
					<div className='custom-dropdown' ref={dropdownRef}>
						<button
							className='custom-dropdown-toggle'
							onClick={handleDropdownToggle}
						>
							<FaRegUser />
						</button>

						{showDropdown && (
							<div className='custom-dropdown-menu'>
								{token && user ? (
									<>
										<div className='profile-header'>
											<FaUserCircle size={40} />
											<div className='profile-info'>
												<div className='profile-name'>{user.name}</div>
												<div className='profile-email'>{user.email}</div>
											</div>
										</div>
										<div className='dropdown-divider'></div>
										<Link
											to='/profile'
											onClick={handleMenuItemClick}
											className='dropdown-item'
										>
											<FaUserCircle /> Profile
										</Link>
										<Link
											to='/my-orders'
											onClick={handleMenuItemClick}
											className='dropdown-item'
										>
											<FaBoxOpen /> Orders
										</Link>
										{user.role === 'admin' && ( // Assuming 'admin' role for bakers
											<Link
												to='/baker-profile-settings'
												onClick={handleMenuItemClick}
												className='dropdown-item'
											>
												<FaCog /> Baker Settings
											</Link>
										)}
										<Link
											to='/help'
											onClick={handleMenuItemClick}
											className='dropdown-item'
										>
											<FaQuestionCircle /> Help and support
										</Link>
										<div className='dropdown-divider'></div>
										<button
											onClick={() => {
												logoutUser()
												handleMenuItemClick()
											}}
											className='dropdown-item'
										>
											<FaSignOutAlt /> Sign out
										</button>
									</>
								) : (
									<>
										<Link
											to='/register'
											onClick={handleMenuItemClick}
											className='dropdown-item'
										>
											<FaSignInAlt /> Sign in / Sign up
										</Link>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
