import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('token')
			if (token) {
				try {
					// You might have an endpoint to verify the token and get user data
					const res = await axios.get('/api/auth/me', {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					})
					setIsAuthenticated(true)
					setUser(res.data)
				} catch (err) {
					console.error('Auth check failed:', err)
					localStorage.removeItem('token')
					setIsAuthenticated(false)
					setUser(null)
				}
			}
			setLoading(false)
		}
		checkAuth()
	}, [])

	const login = async (token, userData) => {
		localStorage.setItem('token', token)
		setIsAuthenticated(true)
		setUser(userData)
	}

	const logout = () => {
		localStorage.removeItem('token')
		setIsAuthenticated(false)
		setUser(null)
	}

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, user, loading, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	)
}
