import React, { useState, useEffect, useRef } from 'react'
import { useUserStore } from '../../store/User'
import { useBakerStore } from '../../store/Baker'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './EditProfile.scss'
import UserIcon from '../../assets/user-placeholder.svg'
import AvailabilitySettings from '../AvailabilitySettings/AvailabilitySettings'

const EditProfile = () => {
	const { userInfo, fetchProfile, updateUserProfile, deleteAccount } = useUserStore()
	const { fetchBakerById } = useBakerStore()
	const token = useUserStore(state => state.token)
	const [activeTab, setActiveTab] = useState('Basic')
	const [formData, setFormData] = useState({
		name: '',
		bakeryName: '',
		email: '',
		phone: '',
		bio: '',
		specialties: '',
		priceRange: '',
		location: '',
	})
	const [imageFile, setImageFile] = useState(null)
	const [imagePreview, setImagePreview] = useState('')
	const [currentPhotoUrl, setCurrentPhotoUrl] = useState('') // For displaying current photo
	const [imageError, setImageError] = useState(false)
	const [galleryImages, setGalleryImages] = useState([])
	const [unavailableDates, setUnavailableDates] = useState([])
	const [settings, setSettings] = useState({
		// Notification Preferences
		emailNotificationsNewOrders: true,
		smsNotificationsUrgentOrders: true,
		emailNotificationsNewReviews: true,
		marketingEmailsPromotions: false,

		// Profile Visibility
		showProfileInSearch: true,
		allowDirectContact: true,
		displayPhoneNumber: false,

		// Account Status
		profileEnabled: true,
	})
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmationName, setConfirmationName] = useState('');

	// Ref for gallery file input
	const galleryInputRef = useRef(null)
	const availabilitySettingsRef = useRef(null);

	const navigate = useNavigate()

	const tabs = ['Basic', 'InfoGallery', 'Availability', 'Settings']

	useEffect(() => {
		if (!token) {
			navigate('/register')
		} else {
			fetchProfile()
		}
	}, [token, fetchProfile, navigate])

	useEffect(() => {
		if (userInfo) {
			setFormData({
				name: userInfo.name || '',
				bakeryName: userInfo.bakeryName || '',
				email: userInfo.email || '',
				phone: userInfo.phone || '',
				bio: userInfo.bio || '',
				specialties: userInfo.specialties ? userInfo.specialties.join(', ') : '',
				priceRange: userInfo.priceRange || '',
				location: userInfo.location || '',
			})
			setUnavailableDates(
				userInfo.unavailableDates?.map(date => new Date(date)) || []
			)
            setGalleryImages(userInfo.gallery ? userInfo.gallery.map(url => ({ 
                id: url, 
                url: url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_BASE_URL}${url}`, 
                file: null 
            })) : []);
			if (userInfo.settings) {
				setSettings(prev => ({
					...prev,
					...userInfo.settings,
				}))
			}
			if (userInfo.image) {
				setCurrentPhotoUrl(userInfo.image) // Set current photo URL
				setImagePreview(userInfo.image)
				setImageError(false) // Reset imageError when a new image is loaded
			}
		}
	}, [userInfo])

	const handleChange = e => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	// Trigger gallery file input click
	const triggerGalleryUpload = () => {
		galleryInputRef.current?.click()
	}

	const handleFileChange = e => {
		const file = e.target.files[0]
		if (file) {
			setImageFile(file)
			setImageError(false)
			setImagePreview(URL.createObjectURL(file)) // Show preview of new photo
		}
	}

	const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
          id: URL.createObjectURL(file), // Temporary ID for preview
          url: URL.createObjectURL(file),
          file: file, // Store the actual file for upload
        }));
        setGalleryImages(prevImages => [...prevImages, ...newImages]);
      };

	const removeGalleryImage = (id) => {
        setGalleryImages(prevImages => prevImages.filter(image => image.id !== id));
    };

	const handleDateClick = date => {
		const dateExists = unavailableDates.some(
			d => d.getTime() === date.getTime()
		)
		if (dateExists) {
			setUnavailableDates(
				unavailableDates.filter(d => d.getTime() !== date.getTime())
			)
		} else {
			setUnavailableDates([...unavailableDates, date])
		}
	}

	const handleSettingsChange = setting => {
		setSettings(prev => ({
			...prev,
			[setting]: !prev[setting],
		}))
	}

	const handleDisableProfile = () => {
		if (
			window.confirm(
				'Are you sure you want to temporarily disable your profile? Your profile will be hidden from customers until you re-enable it.'
			)
		) {
			setSettings(prev => ({
				...prev,
				profileEnabled: false,
			}))
			toast.success('Profile has been temporarily disabled')
		}
	}

	const handleEnableProfile = () => {
		setSettings(prev => ({
			...prev,
			profileEnabled: true,
		}))
		toast.success('Profile has been enabled')
	}

	const handleDeleteAccount = async () => {
        try {
            const result = await deleteAccount();
            if (result.success) {
                toast.success('Account deleted successfully.');
                navigate('/');
            } else {
                toast.error(result.message || 'Failed to delete account.');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting the account.');
        }
	}

	const handleSubmit = async e => {
		e.preventDefault()
		if (activeTab === 'Availability') {
			// Call the handleSubmit from the AvailabilitySettings component via ref
			if (availabilitySettingsRef.current) {
				await availabilitySettingsRef.current.handleSubmit();
			}
			return;
		}
		const data = new FormData()

		for (const key in formData) {
			data.append(key, formData[key])
		}

		if (imageFile) {
			data.append('image', imageFile) // Append the actual file for profile image
		}

        const existingUrls = galleryImages.filter(img => !img.file).map(img => img.url);
        data.append('existingGalleryImages', JSON.stringify(existingUrls));
    
        galleryImages.filter(img => img.file).forEach((imgFile, index) => {
            data.append(`galleryImages`, imgFile.file);
        });

		data.append('unavailableDates', JSON.stringify(unavailableDates))
		data.append('settings', JSON.stringify(settings))

		try {
			const updatedUserInfo = await updateUserProfile(data)
			
			// Update local state with new data from backend (similar to BakerProfileSettings)
			if (updatedUserInfo) {
				setFormData({
					name: updatedUserInfo.name || '',
				bakeryName: updatedUserInfo.bakeryName || '',
				email: updatedUserInfo.email || '',
					phone: updatedUserInfo.phone || '',
					bio: updatedUserInfo.bio || '',
					specialties: updatedUserInfo.specialties ? updatedUserInfo.specialties.join(', ') : '',
					priceRange: updatedUserInfo.priceRange || '',
					location: updatedUserInfo.location || '',
				})
				setCurrentPhotoUrl(updatedUserInfo.image || '') // Update current photo URL
				setGalleryImages(updatedUserInfo.gallery ? updatedUserInfo.gallery.map(url => ({ 
                    id: url, 
                    url: url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_BASE_URL}${url}`, 
                    file: null 
                })) : [])
				setImageFile(null) // Clear selected new photo after successful upload
				
				// Update preview to show the saved image
				if (updatedUserInfo.image) {
					setImagePreview(updatedUserInfo.image)
				}
				await fetchBakerById(updatedUserInfo._id) // Use updatedUserInfo._id here
			}
			
			toast.success('Profile updated successfully!')
			navigate('/profile')
		} catch (error) {
			toast.error('Failed to update profile.')
		}
	}

	const renderBasicTab = () => (
		<div className='tab-content'>
			<div className='profile-header-group'>
				<div className='form-group'>
					<label>Profile Image</label>
					<div className='profile-image-container'>
						<input
							type='file'
							name='image'
							onChange={handleFileChange}
							accept='image/png, image/jpeg, image/jpg'
							id='profileImageUpload'
							style={{ display: 'none' }}
						/>
						<label htmlFor='profileImageUpload' className='profile-image-label'>
							<img
								src={imagePreview && !imageError ? imagePreview : UserIcon}
								alt='Profile'
								className='profile-image'
								onError={() => setImageError(true)}
							/>
						</label>
						<label htmlFor='profileImageUpload' className='upload-icon'></label>
					</div>
					{imageFile && <p className="selected-file-info">Selected file: {imageFile.name}</p>}
				</div>
				<div className='form-group'>
					<label>Name</label>
					<input
						type='text'
						name='name'
						value={formData.name}
						onChange={handleChange}
					/>
				</div>
			</div>
			<div className='form-group'>
				<label>Bakery's Name</label>
				<input
					type='text'
					name='bakeryName'
					value={formData.bakeryName}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label>Email</label>
				<input
					type='email'
					name='email'
					value={formData.email}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label>Phone</label>
				<input
					type='text'
					name='phone'
					value={formData.phone}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label>Bio</label>
				<textarea
					name='bio'
					value={formData.bio}
					onChange={handleChange}
				></textarea>
			</div>
			<div className='form-group'>
				<label>Specialties/Hashtags (comma-separated)</label>
				<input
					type='text'
					name='specialties'
					value={formData.specialties}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label>Price Range</label>
				<input
					type='text'
					name='priceRange'
					value={formData.priceRange}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label>Location</label>
				<input
					type='text'
					name='location'
					value={formData.location}
					onChange={handleChange}
				/>
			</div>
		</div>
	)

	const renderInfoGalleryTab = () => (
		<div className='tab-content'>
			<div className='form-group'>
				<label>Gallery Images</label>
				<div className='gallery-preview'>
					{galleryImages.map((image, index) => (
						<div key={image.id} className='gallery-item'>
							<img
								src={image.url}
								alt={`gallery-item-${index}`}
							/>
							<button
								type='button'
								onClick={() => removeGalleryImage(image.id)}
								className='remove-btn'
							>
								&times;
							</button>
						</div>
					))}

					{/* Hidden file input for gallery */}
					<input
						ref={galleryInputRef}
						type='file'
						multiple
						onChange={handleGalleryChange}
						accept='image/png,image/jpeg,image/jpg'
						style={{ display: 'none' }}
					/>

					{/* Clickable upload area */}
					<div
						className='gallery-upload-box'
						onClick={triggerGalleryUpload}
						style={{ cursor: 'pointer' }}
					>
						<div className='upload-icon'>+</div>
						<div>Add Images</div>
					</div>
				</div>
			</div>
		</div>
	)

	const renderAvailabilityTab = () => (
		<div className='tab-content'>
			<AvailabilitySettings userInfo={userInfo} ref={availabilitySettingsRef} />
		</div>
	)

	const renderSettingsTab = () => (
		<div className='tab-content'>
			<div className='settings-section'>
				<h3>Notification Preferences</h3>
				<div className='settings-group'>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.emailNotificationsNewOrders}
								onChange={() =>
									handleSettingsChange('emailNotificationsNewOrders')
								}
							/>
							<span className='setting-text'>
								Email notifications for new orders
							</span>
						</label>
					</div>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.smsNotificationsUrgentOrders}
								onChange={() =>
									handleSettingsChange('smsNotificationsUrgentOrders')
								}
							/>
							<span className='setting-text'>
								SMS notifications for urgent orders
							</span>
						</label>
					</div>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.emailNotificationsNewReviews}
								onChange={() =>
									handleSettingsChange('emailNotificationsNewReviews')
								}
							/>
							<span className='setting-text'>
								Email notifications for new reviews
							</span>
						</label>
					</div>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.marketingEmailsPromotions}
								onChange={() =>
									handleSettingsChange('marketingEmailsPromotions')
								}
							/>
							<span className='setting-text'>
								Marketing emails and promotions
							</span>
						</label>
					</div>
				</div>
			</div>

			<div className='settings-section'>
				<h3>Profile Visibility</h3>
				<div className='settings-group'>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.showProfileInSearch}
								onChange={() => handleSettingsChange('showProfileInSearch')}
							/>
							<span className='setting-text'>
								Show my profile in baker search results
							</span>
						</label>
					</div>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.allowDirectContact}
								onChange={() => handleSettingsChange('allowDirectContact')}
							/>
							<span className='setting-text'>
								Allow customers to contact me directly
							</span>
						</label>
					</div>
					<div className='setting-item'>
						<label className='setting-label'>
							<input
								type='checkbox'
								checked={settings.displayPhoneNumber}
								onChange={() => handleSettingsChange('displayPhoneNumber')}
							/>
							<span className='setting-text'>
								Display my phone number on profile
							</span>
						</label>
					</div>
				</div>
			</div>

			<div className='settings-section danger-zone'>
				<h3>Danger Zone</h3>
				<div className='danger-zone-content'>
					<div className='danger-item'>
						<div className='danger-info'>
							<h4>Temporarily Disable Profile</h4>
							<p>
								Your profile will be hidden from customers but your data will be
								preserved.
							</p>
						</div>
						{settings.profileEnabled ? (
							<button
								type='button'
								className='btn-warning'
								onClick={handleDisableProfile}
							>
								Disable Profile
							</button>
						) : (
							<button
								type='button'
								className='btn-success'
								onClick={handleEnableProfile}
							>
								Enable Profile
							</button>
						)}
					</div>

					<div className='danger-item'>
						<div className='danger-info'>
							<h4>Delete Account</h4>
							<p>
								Permanently delete your account and all associated data. This
								action cannot be undone.
							</p>
						</div>
						<button
							type='button'
							className='btn-danger'
							onClick={() => setIsDeleteModalOpen(true)}
						>
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	)

	const renderTabContent = () => {
		switch (activeTab) {
			case 'Basic':
				return renderBasicTab()
			case 'InfoGallery':
				return renderInfoGalleryTab()
			case 'Availability':
				return renderAvailabilityTab()
			case 'Settings':
				return renderSettingsTab()
			default:
				return renderBasicTab()
		}
	}

	return (
		<div className='edit-profile-page'>
			<h2>Edit Profile</h2>

			<div className='tabs-container'>
				<div className='tabs-nav'>
					{tabs.map(tab => (
						<button
							key={tab}
							className={`tab-button ${activeTab === tab ? 'active' : ''}`}
							onClick={() => setActiveTab(tab)}
							type='button'
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			<div className='edit-profile-actions'>
				<button
					type='button'
					className='btn-secondary'
					onClick={() => navigate(`/bakers/${userInfo._id}`)}
					disabled={!userInfo}
				>
					View Profile
				</button>
				<button type='submit' form='edit-profile-form' className='btn-primary'>
					Save Changes
				</button>
			</div>

			<form onSubmit={handleSubmit} className='edit-profile-form' id='edit-profile-form'>
				{renderTabContent()}
			</form>

            {isDeleteModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Delete Account</h3>
                        <p>This action is irreversible. To confirm, please type your name: <strong>{userInfo.name}</strong></p>
                        <input 
                            type="text" 
                            value={confirmationName}
                            onChange={(e) => setConfirmationName(e.target.value)}
                            placeholder="Enter your name"
                        />
                        <div className="modal-actions">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
                            <button 
                                onClick={handleDeleteAccount} 
                                className="btn-danger" 
                                disabled={confirmationName !== userInfo.name}
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
		</div>
	)
}

export default EditProfile