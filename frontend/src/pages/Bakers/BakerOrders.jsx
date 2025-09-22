import React, { useState } from 'react'
import toast from 'react-hot-toast'
import macarons from '../../assets/macarons.png'
import './BakerOrders.scss'

import { jwtDecode } from 'jwt-decode'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/User'

const Auth = () => {
	const [newUser, setNewUser] = useState({
		name: '',
		email: '',
		password: '',
		role: '',
		bio: '',
		phone: '',
	})

	const [imageFile, setImageFile] = useState(null)
	const [isLogin, setIsLogin] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [verificationCode, setVerificationCode] = useState('')
	const [generatedCode, setGeneratedCode] = useState('')
	const [isVerificationStep, setIsVerificationStep] = useState(false)
	const [isPhoneVerified, setIsPhoneVerified] = useState(false)
	const [verificationTimer, setVerificationTimer] = useState(0)
	const [isResendAvailable, setIsResendAvailable] = useState(true)
	const [fieldErrors, setFieldErrors] = useState({})

	const { createUser, loginUser } = useUserStore()
	const navigate = useNavigate()

	// Валидация полей
	const validateFields = () => {
		const errors = {}

		if (isLogin) {
			// Валидация для входа
			if (!newUser.email.trim()) {
				errors.email = 'Введите email'
			} else if (!isValidEmail(newUser.email)) {
				errors.email = 'Введите корректный email'
			}

			if (!newUser.password.trim()) {
				errors.password = 'Введите пароль'
			} else if (newUser.password.length < 6) {
				errors.password = 'Пароль должен содержать минимум 6 символов'
			}
		} else {
			// Валидация для регистрации
			if (!newUser.name.trim()) {
				errors.name = 'Введите имя'
			} else if (newUser.name.trim().length < 2) {
				errors.name = 'Имя должно содержать минимум 2 символа'
			}

			if (!newUser.email.trim()) {
				errors.email = 'Введите email'
			} else if (!isValidEmail(newUser.email)) {
				errors.email = 'Введите корректный email'
			}

			if (!newUser.password.trim()) {
				errors.password = 'Введите пароль'
			} else if (newUser.password.length < 6) {
				errors.password = 'Пароль должен содержать минимум 6 символов'
			} else if (!isStrongPassword(newUser.password)) {
				errors.password = 'Пароль должен содержать буквы и цифры'
			}

			if (!newUser.phone.trim()) {
				errors.phone = 'Введите номер телефона'
			} else if (!validatePhoneNumber(newUser.phone)) {
				errors.phone = 'Введите корректный номер телефона'
			} else if (!isPhoneVerified) {
				errors.phone = 'Подтвердите номер телефона'
			}

			if (!newUser.role) {
				errors.role = 'Выберите роль'
			}

			if (!newUser.bio.trim()) {
				errors.bio = 'Расскажите о себе'
			} else if (newUser.bio.trim().length < 10) {
				errors.bio = 'Описание должно содержать минимум 10 символов'
			}

			if (!imageFile) {
				errors.image = 'Загрузите фотографию профиля'
			} else {
				// Проверка типа файла
				const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
				if (!allowedTypes.includes(imageFile.type)) {
					errors.image = 'Загрузите изображение в формате JPEG, PNG или WebP'
				}
				// Проверка размера файла (макс 5МБ)
				else if (imageFile.size > 5 * 1024 * 1024) {
					errors.image = 'Размер изображения не должен превышать 5МБ'
				}
			}
		}

		setFieldErrors(errors)
		return Object.keys(errors).length === 0
	}

	// Валидация email
	const isValidEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	// Валидация сложности пароля
	const isStrongPassword = (password) => {
		const hasLetter = /[a-zA-Z]/.test(password)
		const hasNumber = /\d/.test(password)
		return hasLetter && hasNumber
	}

	// Валидация номера телефона
	const validatePhoneNumber = phone => {
		const phoneRegex =
			/^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/
		return phoneRegex.test(phone.replace(/\s+/g, ''))
	}

	// Форматирование номера телефона
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

	// Генерация случайного 6-значного кода
	const generateVerificationCode = () => {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	// Отправка SMS (имитация)
	const sendSMSVerification = async phoneNumber => {
		try {
			const code = generateVerificationCode()
			setGeneratedCode(code)

			toast.success(`Код верификации отправлен на ${phoneNumber}`)
			toast.success(`Демо код: ${code}`, { duration: 5000 })

			return { success: true, code }
		} catch (error) {
			console.error('Ошибка отправки SMS:', error)
			toast.error('Ошибка при отправке SMS. Попробуйте позже.')
			return { success: false }
		}
	}

	// Старт таймера для повторной отправки
	const startResendTimer = () => {
		setIsResendAvailable(false)
		setVerificationTimer(60)

		const timer = setInterval(() => {
			setVerificationTimer(prev => {
				if (prev <= 1) {
					setIsResendAvailable(true)
					clearInterval(timer)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	// Верификация номера телефона
	const verifyPhoneNumber = async () => {
		// Очистка предыдущих ошибок
		setFieldErrors(prev => ({ ...prev, phone: '' }))

		if (!newUser.phone) {
			setFieldErrors(prev => ({ ...prev, phone: 'Введите номер телефона' }))
			setErrorMessage('Введите номер телефона')
			return
		}

		if (!validatePhoneNumber(newUser.phone)) {
			setFieldErrors(prev => ({ ...prev, phone: 'Введите корректный номер телефона' }))
			setErrorMessage('Введите корректный номер телефона')
			return
		}

		const formattedPhone = formatPhoneNumber(newUser.phone)
		setNewUser(prev => ({ ...prev, phone: formattedPhone }))

		const result = await sendSMSVerification(formattedPhone)

		if (result.success) {
			setIsVerificationStep(true)
			setErrorMessage('')
			setFieldErrors(prev => ({ ...prev, phone: '' }))
			startResendTimer()
		}
	}

	// Повторная отправка кода
	const resendVerificationCode = async () => {
		if (!isResendAvailable) return

		const result = await sendSMSVerification(newUser.phone)
		if (result.success) {
			setVerificationCode('')
			startResendTimer()
			toast.success('Код отправлен повторно')
		}
	}

	// Проверка введенного кода
	const checkVerificationCode = () => {
		if (!verificationCode) {
			setErrorMessage('Введите код верификации')
			return
		}

		if (verificationCode.length !== 6) {
			setErrorMessage('Код должен содержать 6 цифр')
			return
		}

		if (verificationCode === generatedCode) {
			toast.success('Номер телефона успешно верифицирован!')
			setIsVerificationStep(false)
			setIsPhoneVerified(true)
			setVerificationCode('')
			setErrorMessage('')
			setFieldErrors(prev => ({ ...prev, phone: '' }))
			handleUserAction(true) // Продолжаем регистрацию
		} else {
			setErrorMessage('Неверный код верификации. Попробуйте снова.')
		}
	}

	// Обработка изменения номера телефона
	const handlePhoneChange = e => {
		let value = e.target.value

		// Разрешаем только цифры, +, пробелы, скобки и дефисы
		value = value.replace(/[^0-9+\s()-]/g, '')

		// Ограничиваем длину
		if (value.length > 18) return

		setNewUser({ ...newUser, phone: value })

		// Очищаем ошибку поля при изменении
		if (fieldErrors.phone) {
			setFieldErrors(prev => ({ ...prev, phone: '' }))
		}

		// Сбрасываем статус верификации при изменении номера
		if (isPhoneVerified) {
			setIsPhoneVerified(false)
		}
	}

	// Обработка изменения полей с очисткой ошибок
	const handleFieldChange = (field, value) => {
		setNewUser(prev => ({ ...prev, [field]: value }))
		
		// Очищаем ошибку поля при изменении
		if (fieldErrors[field]) {
			setFieldErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	// Обработка изменения файла
	const handleFileChange = (e) => {
		const file = e.target.files[0]
		setImageFile(file)
		
		// Очищаем ошибку при выборе файла
		if (fieldErrors.image) {
			setFieldErrors(prev => ({ ...prev, image: '' }))
		}
	}

	const handleUserAction = async (isAfterVerification = false) => {
		// Валидация полей перед отправкой
		if (!validateFields()) {
			const firstError = Object.values(fieldErrors)[0]
			setErrorMessage(firstError || 'Пожалуйста, заполните все обязательные поля')
			return
		}

		let response

		if (isLogin) {
			response = await loginUser({
				email: newUser.email,
				password: newUser.password,
			})
		} else {
			// Если это этап верификации, не выполняем регистрацию
			if (isVerificationStep && !isAfterVerification) return

			// Проверяем верификацию телефона перед регистрацией
			if (newUser.phone && !isPhoneVerified && !isAfterVerification) {
				await verifyPhoneNumber()
				return
			}

			const formData = new FormData()
			Object.entries(newUser).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					formData.append(key, value)
				}
			})
			if (imageFile) formData.append('image', imageFile)

			response = await createUser(formData)
		}

		const { success, token, message, userData } = response || {}

		if (success) {
			try {
				localStorage.setItem('token', token)
				localStorage.setItem('user', JSON.stringify(userData))

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
				setErrorMessage('Ошибка авторизации. Попробуйте снова.')
			}
		} else {
			setErrorMessage(message || 'Произошла ошибка. Попробуйте снова.')
		}
	}

	// Сброс формы при переключении между входом и регистрацией
	const toggleAuthMode = () => {
		setIsLogin(!isLogin)
		setErrorMessage('')
		setFieldErrors({})
		setIsPhoneVerified(false)
		setImageFile(null)
		setNewUser({
			name: '',
			email: '',
			password: '',
			role: '',
			bio: '',
			phone: '',
		})
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
		<>
			<main className='admin-main'>
				<div className='container_add'>
					<div className='form'>
						<img src={macarons} alt='' className='macarons' />
						<h1>
							{isLogin
								? 'Вход'
								: isVerificationStep
								? 'Верификация телефона'
								: 'Регистрация'}
						</h1>

						{isVerificationStep ? (
							<>
								<div className='verification-info'>
									<p>Код верификации отправлен на</p>
									<p>
										<strong>{newUser.phone}</strong>
									</p>
									<p>Введите 6-значный код из SMS</p>
								</div>
								<input
									type='text'
									placeholder='Код верификации'
									value={verificationCode}
									onChange={e =>
										setVerificationCode(
											e.target.value.replace(/\D/g, '').slice(0, 6)
										)
									}
									maxLength={6}
									className='verification-input'
								/>
								<button
									className='submit'
									onClick={checkVerificationCode}
									disabled={verificationCode.length !== 6}
								>
									Подтвердить
								</button>

								<div className='resend-section'>
									{isResendAvailable ? (
										<button
											className='resend-button'
											onClick={resendVerificationCode}
											type='button'
										>
											Отправить код повторно
										</button>
									) : (
										<p className='resend-timer'>
											Повторная отправка через {verificationTimer} сек
										</p>
									)}
								</div>

								<button
									className='switch'
									onClick={() => {
										setIsVerificationStep(false)
										setVerificationCode('')
										setErrorMessage('')
										setVerificationTimer(0)
										setIsResendAvailable(true)
									}}
								>
									Назад к регистрации
								</button>
							</>
						) : (
							<>
								{!isLogin && (
									<>
										<div className='input-container'>
											<input
												type='text'
												placeholder='Имя *'
												name='name'
												value={newUser.name}
												onChange={e => handleFieldChange('name', e.target.value)}
												className={fieldErrors.name ? 'error' : ''}
											/>
											{fieldErrors.name && (
												<span className='field-error'>{fieldErrors.name}</span>
											)}
										</div>
									</>
								)}
								
								<div className='input-container'>
									<input
										type='email'
										placeholder='Электронная почта *'
										name='email'
										value={newUser.email}
										onChange={e => handleFieldChange('email', e.target.value)}
										className={fieldErrors.email ? 'error' : ''}
									/>
									{fieldErrors.email && (
										<span className='field-error'>{fieldErrors.email}</span>
									)}
								</div>

								<div className='input-container'>
									<input
										type='password'
										placeholder='Пароль *'
										name='password'
										value={newUser.password}
										onChange={e => handleFieldChange('password', e.target.value)}
										className={fieldErrors.password ? 'error' : ''}
									/>
									{fieldErrors.password && (
										<span className='field-error'>{fieldErrors.password}</span>
									)}
								</div>

								{!isLogin && (
									<>
										<div className='input-container'>
											<div className='phone-input-container'>
												<input
													type='tel'
													name='phone'
													placeholder='Номер телефона *'
													value={newUser.phone}
													onChange={handlePhoneChange}
													className={`${isPhoneVerified ? 'verified' : ''} ${fieldErrors.phone ? 'error' : ''}`}
												/>
												{isPhoneVerified && (
													<span className='verification-status verified'>
														✓ Подтвержден
													</span>
												)}
											</div>
											{fieldErrors.phone && (
												<span className='field-error'>{fieldErrors.phone}</span>
											)}
										</div>

										<div className='input-container'>
											<input
												type='file'
												accept='image/*'
												onChange={handleFileChange}
												className={fieldErrors.image ? 'error' : ''}
											/>
											{fieldErrors.image && (
												<span className='field-error'>{fieldErrors.image}</span>
											)}
										</div>

										<div className='input-container'>
											<select
												value={newUser.role}
												onChange={e => handleFieldChange('role', e.target.value)}
												className={fieldErrors.role ? 'error' : ''}
											>
												<option value='' disabled>
													Выберите роль *
												</option>
												<option value={'user'}>Пользователь</option>
												<option value={'admin'}>Кондитер</option>
											</select>
											{fieldErrors.role && (
												<span className='field-error'>{fieldErrors.role}</span>
											)}
										</div>

										<div className='input-container'>
											<textarea
												name='bio'
												placeholder='О себе (минимум 10 символов) *'
												value={newUser.bio}
												onChange={e => handleFieldChange('bio', e.target.value)}
												className={fieldErrors.bio ? 'error' : ''}
											></textarea>
											{fieldErrors.bio && (
												<span className='field-error'>{fieldErrors.bio}</span>
											)}
										</div>
									</>
								)}
								<button className='submit' onClick={handleUserAction}>
									{isLogin ? 'Войти' : 'Зарегистрироваться'}
								</button>
							</>
						)}

						{errorMessage && <p className='error-message'>{errorMessage}</p>}

						{!isVerificationStep && (
							<button className='switch' onClick={toggleAuthMode}>
								{isLogin
									? 'Нет аккаунта? Зарегистрируйтесь'
									: 'Уже есть аккаунт? Войти'}
							</button>
						)}
					</div>
				</div>
			</main>
		</>
	)
}

export default Auth