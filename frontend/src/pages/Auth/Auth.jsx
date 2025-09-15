import React, { useState } from 'react'
import toast from 'react-hot-toast'
import macarons from '../../assets/macarons.png'
import './Auth.scss'

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

	const { createUser, loginUser } = useUserStore()
	const navigate = useNavigate()

	// Валидация номера телефона
	const validatePhoneNumber = phone => {
		// Проверяем формат телефона (российский номер)
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
			// Здесь должна быть интеграция с SMS сервисом (например, Twilio, SMS.ru, etc.)
			const code = generateVerificationCode()
			setGeneratedCode(code)

			// Имитация отправки SMS

			// В реальном приложении вы бы отправили запрос на ваш backend:
			/*
            const response = await fetch('/api/send-sms-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    code: code
                })
            });
            */

			toast.success(`Код верификации отправлен на ${phoneNumber}`)

			// Для демонстрации показываем код в консоли
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
		if (!newUser.phone) {
			setErrorMessage('Введите номер телефона')
			return
		}

		if (!validatePhoneNumber(newUser.phone)) {
			setErrorMessage('Введите корректный номер телефона')
			return
		}

		const formattedPhone = formatPhoneNumber(newUser.phone)
		setNewUser(prev => ({ ...prev, phone: formattedPhone }))

		const result = await sendSMSVerification(formattedPhone)

		if (result.success) {
			setIsVerificationStep(true)
			setErrorMessage('')
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

		if (verificationCode === generatedCode) {
			toast.success('Номер телефона успешно верифицирован!')
			setIsVerificationStep(false)
			setIsPhoneVerified(true)
			setVerificationCode('')
			setErrorMessage('')
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

		// Сбрасываем статус верификации при изменении номера
		if (isPhoneVerified) {
			setIsPhoneVerified(false)
		}
	}

	const handleUserAction = async (isAfterVerification = false) => {
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

			// To inspect FormData content (for debugging, not for production):

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
									<input
										type='text'
										placeholder='Имя'
										name='name'
										value={newUser.name}
										onChange={e =>
											setNewUser({ ...newUser, name: e.target.value })
										}
									/>
								)}
								<input
									type='email'
									placeholder='Электронная почта'
									name='email'
									value={newUser.email}
									onChange={e =>
										setNewUser({ ...newUser, email: e.target.value })
									}
								/>
								<input
									type='password'
									placeholder='Пароль'
									name='password'
									value={newUser.password}
									onChange={e =>
										setNewUser({ ...newUser, password: e.target.value })
									}
								/>
								{!isLogin && (
									<>
										<div className='phone-input-container'>
											<input
												type='tel'
												name='phone'
												placeholder='Номер телефона'
												value={newUser.phone}
												onChange={handlePhoneChange}
												className={isPhoneVerified ? 'verified' : ''}
											/>
											{isPhoneVerified && (
												<span className='verification-status verified'>
													✓ Подтвержден
												</span>
											)}
										</div>

										<input
											type='file'
											accept='image/*'
											onChange={e => setImageFile(e.target.files[0])}
										/>
										<select
											value={newUser.role}
											onChange={e =>
												setNewUser({ ...newUser, role: e.target.value })
											}
										>
											<option value='' disabled>
												Выберите роль
											</option>
											<option value={'user'}>Пользователь</option>
											<option value={'admin'}>Кондитер</option>
										</select>
										<textarea
											name='bio'
											placeholder='О себе'
											value={newUser.bio}
											onChange={e =>
												setNewUser({ ...newUser, bio: e.target.value })
											}
										></textarea>
									</>
								)}
								<button className='submit' onClick={handleUserAction}>
									{isLogin ? 'Войти' : 'Зарегистрироваться'}
								</button>
							</>
						)}

						{errorMessage && <p className='error-message'>{errorMessage}</p>}

						{!isVerificationStep && (
							<button
								className='switch'
								onClick={() => {
									setIsLogin(!isLogin)
									setErrorMessage('')
									setIsPhoneVerified(false)
									setNewUser({
										name: '',
										email: '',
										password: '',
										role: '',
										bio: '',
										phone: '',
									})
								}}
							>
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
