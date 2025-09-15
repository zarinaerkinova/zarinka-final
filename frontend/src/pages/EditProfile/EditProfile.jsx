import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/User';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './EditProfile.scss';

const EditProfile = () => {
    const { userInfo, fetchProfile, updateUserProfile } = useUserStore();
    const token = useUserStore(state => state.token);
    const [formData, setFormData] = useState({
        name: '',
        bakeryName: '',
        email: '',
        phone: '',
        bio: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/register');
        } else {
            fetchProfile();
        }
    }, [token, fetchProfile, navigate]);

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || '',
                bakeryName: userInfo.bakeryName || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                bio: userInfo.bio || '',
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            await updateUserProfile(data);
            toast.success('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            toast.error('Failed to update profile.');
        }
    };

    return (
        <div className="edit-profile-page">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="profile-header-group">
                    <div className="form-group">
                        <label>Profile Image</label>
                        <div className="file-input-container">
                            <input 
                                type="file" 
                                name="image" 
                                onChange={handleFileChange} 
                                accept="image/png, image/jpeg, image/jpg" 
                                id="profileImageUpload"
                                className="hidden-file-input"
                            />
                            <label htmlFor="profileImageUpload" className="custom-file-upload-button">
                                Choose File
                            </label>
                            {imageFile && <span className="file-name">{imageFile.name}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} readOnly />
                    </div>
                </div>
                <div className="form-group">
                    <label>Bakery's Name</label>
                    <input type="text" name="bakeryName" value={formData.bakeryName} onChange={handleChange} readOnly />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} readOnly />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} readOnly />
                </div>
                <div className="form-group">
                    <label>Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} readOnly></textarea>
                </div>
                <button type="submit" className="btn-primary">Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;
