import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import macarons from '../../assets/macarons.png'
import { useUserStore } from '../../store/User'
import './Auth.scss'

const Auth = () => {
	const [userData, setUserData] = useState({
		name: '',
		bakeryName: '',
		email: '',
		password: '',
		role: '',
		bio: '',
		phone: '',
		location: '',
		priceRange: '',
	})

	const [passwordConfirm, setPasswordConfirm] = useState('')
	const [profileImage, setProfileImage] = useState(null)
	const [isLoginMode, setIsLoginMode] = useState(true)
	const [validationError, setValidationError] = useState('')
	const [smsCode, setSmsCode] = useState('')
	const [systemCode, setSystemCode] = useState('')
	const [showVerification, setShowVerification] = useState(false)
	const [phoneVerified, setPhoneVerified] = useState(false)
	const [countdown, setCountdown] = useState(0)
	const [canResend, setCanResend] = useState(true)
	const [showRoleSelection, setShowRoleSelection] = useState(false)

	const { createUser, loginUser } = useUserStore()
	const navigate = useNavigate()

	const validatePhoneNumber = phone => {
		const phoneRegex =
			/^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/
		return phoneRegex.test(phone.replace(/\s+/g, ''))
	}

	const formatPhoneNumber = phone => {
		const cleaned = phone.replace(/\D/g, '')
		if (cleaned.startsWith('8')) {
			return '+7' + cleaned.slice(1)
		} else if (cleaned.startsWith('7')) {
			return '+' + cleaned
		} else if (cleaned.length === 10) {
			return '+7' + cleaned
		}
		return phone
	}

	const generateVerificationCode = () => {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	const sendSMSVerification = async phoneNumber => {
		try {
			const code = generateVerificationCode()
			setSystemCode(code)
			toast.success(`Код верификации отправлен на ${phoneNumber}`)
			toast.success(`Демо код: ${code}`, { duration: 5000 })
			return { success: true, code }
		} catch (error) {
			console.error('Ошибка отправки SMS:', error)
			toast.error('Ошибка при отправке SMS. Попробуйте позже.')
			return { success: false }
		}
	}

	const startResendTimer = () => {
		setCanResend(false)
		setCountdown(60)

		const timer = setInterval(() => {
			setCountdown(prev => {
				if (prev <= 1) {
					setCanResend(true)
					clearInterval(timer)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	const verifyPhoneNumber = async () => {
		if (!userData.phone) {
			setValidationError('Введите номер телефона')
			return
		}

		if (!validatePhoneNumber(userData.phone)) {
			setValidationError('Введите корректный номер телефона')
			return
		}

		const formattedPhone = formatPhoneNumber(userData.phone)
		setUserData(prev => ({ ...prev, phone: formattedPhone }))

		const result = await sendSMSVerification(formattedPhone)

		if (result.success) {
			setShowVerification(true)
			setValidationError('')
			startResendTimer()
		}
	}

	const resendVerificationCode = async () => {
		if (!canResend) return

		const result = await sendSMSVerification(userData.phone)
		if (result.success) {
			setSmsCode('')
			startResendTimer()
			toast.success('Код отправлен повторно')
		}
	}

	const checkVerificationCode = () => {
		if (!smsCode) {
			setValidationError('Введите код верификации')
			return
		}

		if (smsCode === systemCode) {
			toast.success('Номер телефона успешно верифицирован!')
			setShowVerification(false)
			setPhoneVerified(true)
			setSmsCode('')
			setValidationError('')
			handleUserAction(true)
		} else {
			setValidationError('Неверный код верификации. Попробуйте снова.')
		}
	}

	const handlePhoneChange = e => {
		let value = e.target.value
		value = value.replace(/[^0-9+\s()-]/g, '')
		if (value.length > 18) return
		setUserData({ ...userData, phone: value })
		if (phoneVerified) {
			setPhoneVerified(false)
		}
	}

	const selectRole = role => {
		setUserData({ ...userData, role })
		setShowRoleSelection(false)
	}

	const handleUserAction = async (isAfterVerification = false) => {
		let response

		if (isLoginMode) {
			response = await loginUser({
				email: userData.email,
				password: userData.password,
			})
		} else {
			if (userData.password !== passwordConfirm) {
				setValidationError('Пароли не совпадают')
				return
			}

			if (showVerification && !isAfterVerification) return

			if (userData.phone && !phoneVerified && !isAfterVerification) {
				await verifyPhoneNumber()
				return
			}

			const formData = new FormData()
			Object.entries(userData).forEach(([key, value]) => {
				const safeValue = value ?? ''
				formData.append(key, safeValue)
			})
			if (profileImage) formData.append('image', profileImage)

			response = await createUser(formData)
		}

		const {
			success,
			token,
			message,
			userData: userDataResponse,
		} = response || {}

		if (success) {
			try {
				localStorage.setItem('token', token)
				localStorage.setItem('user', JSON.stringify(userDataResponse))

				const decoded = jwtDecode(token)
				const expiryTime = decoded.exp * 1000
				localStorage.setItem('expiryTime', expiryTime)

				setTimeout(() => {
					localStorage.clear()
					window.location.href = '/login'
				}, expiryTime - Date.now())

				navigate('/profile')
			} catch (decodeError) {
				console.error('JWT Decode failed:', decodeError)
				localStorage.clear()
				setValidationError('Ошибка авторизации. Попробуйте снова.')
			}
		} else {
			setValidationError(message || 'Произошла ошибка. Попробуйте снова.')
		}
	}

	useEffect(() => {
		const token = localStorage.getItem('token')
		const expiryTime = localStorage.getItem('expiryTime')

		if (token && expiryTime) {
			const now = Date.now()
			const expiry = Number(expiryTime)

			if (isNaN(expiry) || now > expiry) {
				localStorage.clear()
				navigate('/login')
			} else {
				const remainingTime = expiry - now
				setTimeout(() => {
					localStorage.clear()
					window.location.href = '/login'
				}, remainingTime)

				navigate('/profile')
			}
		}
	}, [navigate])

	return (
		<main className='auth-page'>
			<div className='auth-container'>
				<div className='auth-form-wrapper'>
					<img src={macarons} alt='Logo' className='auth-logo' />
					<h1 className='auth-title'>
						{isLoginMode
							? 'Вход'
							: showVerification
							? 'Верификация телефона'
							: showRoleSelection
							? 'Выберите роль'
							: 'Регистрация'}
					</h1>

					{!isLoginMode && showRoleSelection ? (
						<div className='role-selection'>
							<button
								className='role-card customer-role'
								onClick={() => selectRole('user')}
							>
								<div className='role-icon'>🛍️</div>
								<h3>Покупатель</h3>
								<p>Заказывайте вкусные сладости от лучших кондитеров</p>
							</button>
							<button
								className='role-card baker-role'
								onClick={() => selectRole('admin')}
							>
								<div className='role-icon'>👨‍🍳</div>
								<h3>Кондитер</h3>
								<p>Создавайте и продавайте свои кулинарные шедевры</p>
							</button>
						</div>
					) : showVerification ? (
						<>
							<div className='verification-info-box'>
								<p>Код верификации отправлен на</p>
								<p>
									<strong>{userData.phone}</strong>
								</p>
								<p>Введите 6-значный код из SMS</p>
							</div>
							<input
								type='text'
								placeholder='Код верификации'
								value={smsCode}
								onChange={e =>
									setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))
								}
								maxLength={6}
								className='verification-code-input'
							/>
							<button
								className='primary-button'
								onClick={checkVerificationCode}
								disabled={smsCode.length !== 6}
							>
								Подтвердить
							</button>

							<div className='resend-wrapper'>
								{canResend ? (
									<button
										className='resend-code-button'
										onClick={resendVerificationCode}
										type='button'
									>
										Отправить код повторно
									</button>
								) : (
									<p className='resend-countdown'>
										Повторная отправка через {countdown} сек
									</p>
								)}
							</div>

							<button
								className='back-button'
								onClick={() => {
									setShowVerification(false)
									setSmsCode('')
									setValidationError('')
									setCountdown(0)
									setCanResend(true)
								}}
							>
								Назад к регистрации
							</button>
						</>
					) : (
						<>
							{!isLoginMode && !userData.role && (
								<button
									className='select-role-button'
									onClick={() => setShowRoleSelection(true)}
								>
									Сначала выберите роль
								</button>
							)}

							{(!isLoginMode && userData.role) || isLoginMode ? (
								<>
									{!isLoginMode && (
										<input
											type='text'
											placeholder='Имя'
											name='name'
											value={userData.name}
											onChange={e =>
												setUserData({ ...userData, name: e.target.value })
											}
											className='auth-input'
										/>
									)}
									<input
										type='email'
										placeholder='Электронная почта'
										name='email'
										value={userData.email}
										onChange={e =>
											setUserData({ ...userData, email: e.target.value })
										}
										className='auth-input'
									/>
									<input
										type='password'
										placeholder='Пароль'
										name='password'
										value={userData.password}
										onChange={e =>
											setUserData({ ...userData, password: e.target.value })
										}
										className='auth-input'
									/>
									{!isLoginMode && (
										<input
											type='password'
											placeholder='Повторите пароль'
											value={passwordConfirm}
											onChange={e => setPasswordConfirm(e.target.value)}
											className='auth-input'
										/>
									)}
									{!isLoginMode && (
										<>
											<div className='phone-field-wrapper'>
												<input
													type='tel'
													name='phone'
													placeholder='Номер телефона'
													value={userData.phone}
													onChange={handlePhoneChange}
													className={`auth-input ${
														phoneVerified ? 'phone-verified' : ''
													}`}
												/>
												{phoneVerified && (
													<span className='phone-status-badge verified-badge'>
														✓ Подтвержден
													</span>
												)}
											</div>

											{userData.role === 'admin' && (
												<>
													<input
														type='text'
														placeholder='Название кондитерской'
														name='bakeryName'
														value={userData.bakeryName}
														onChange={e =>
															setUserData({
																...userData,
																bakeryName: e.target.value,
															})
														}
														className='auth-input'
													/>
													<input
														type='text'
														placeholder='Локация'
														name='location'
														value={userData.location}
														onChange={e =>
															setUserData({
																...userData,
																location: e.target.value,
															})
														}
														className='auth-input'
													/>
													<input
														type='number'
														placeholder='Цена услуги от'
														name='priceRange'
														value={userData.priceRange}
														onChange={e =>
															setUserData({
																...userData,
																priceRange: e.target.value,
															})
														}
														className='auth-input'
													/>
												</>
											)}

											<div className='selected-role-display'>
												<span className='role-label'>Выбранная роль:</span>
												<span
													className={`role-badge ${
														userData.role === 'user'
															? 'customer-badge'
															: 'baker-badge'
													}`}
												>
													{userData.role === 'user'
														? '🛍️ Покупатель'
														: '👨‍🍳 Кондитер'}
												</span>
												<button
													className='change-role-link'
													onClick={() => setShowRoleSelection(true)}
												>
													Изменить
												</button>
											</div>

											<input
												type='file'
												accept='image/*'
												onChange={e => setProfileImage(e.target.files[0])}
												className='file-input'
											/>
											<textarea
												name='bio'
												placeholder='О себе'
												value={userData.bio}
												onChange={e =>
													setUserData({ ...userData, bio: e.target.value })
												}
												className='auth-textarea'
											></textarea>
										</>
									)}
									<button className='primary-button' onClick={handleUserAction}>
										{isLoginMode ? 'Войти' : 'Зарегистрироваться'}
									</button>
								</>
							) : null}
						</>
					)}

					{validationError && <p className='error-alert'>{validationError}</p>}

					{!showVerification && (
						<button
							className='toggle-mode-button'
							onClick={() => {
								setIsLoginMode(!isLoginMode)
								setValidationError('')
								setPhoneVerified(false)
								setShowRoleSelection(false)
								setUserData({
									name: '',
									bakeryName: '',
									email: '',
									password: '',
									role: '',
									bio: '',
									phone: '',
									location: '',
									priceRange: '',
								})
								setPasswordConfirm('')
								setProfileImage(null)
								setSmsCode('')
							}}
						>
							{isLoginMode
								? 'Нет аккаунта? Зарегистрируйтесь'
								: 'Уже есть аккаунт? Войти'}
						</button>
					)}
				</div>
			</div>
		</main>
	)
}

export default Auth
