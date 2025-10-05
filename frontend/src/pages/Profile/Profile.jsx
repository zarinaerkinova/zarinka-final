import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/User'
import BakerDashboard from '../BakerDashboard/BakerDashboard'
import UserProfile from '../UserProfile/UserProfile'

const Profile = () => {
	const { user } = useUserStore()

	const navigate = useNavigate()
	useEffect(() => {
		if (user?.role === 'admin') navigate('/profile')
		else if (user?.role === 'user') navigate('/profile')
	}, [user, navigate])

	return (
		<>
			{user?.role === 'admin' && <BakerDashboard />}
			{user?.role === 'user' && <UserProfile />}
		</>
	)
}

export default Profile
