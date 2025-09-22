import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/User'; // Assuming user store has baker info
import axios from 'axios'; // Import axios
import toast from 'react-hot-toast'; // Assuming toast is available for notifications
import './BakerProfileSettings.scss';

const BakerProfileSettings = () => {
  const navigate = useNavigate();
  const { user, token, setUserData } = useUserStore(); // Get user info and token

  // State for Basic Info
  const [bakerName, setBakerName] = useState('');
  const [bakeryName, setBakeryName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [constructorOptions, setConstructorOptions] = useState('');
  const [photo, setPhoto] = useState(null); // For photo upload (File object)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(''); // For displaying current photo

  // State for Gallery
  const [galleryImages, setGalleryImages] = useState([]);

  // State for Availability
  const [maxOrdersPerDay, setMaxOrdersPerDay] = useState(0);
  const [workingHours, setWorkingHours] = useState({
    Monday: { from: '', to: '' },
    Tuesday: { from: '', to: '' },
    Wednesday: { from: '', to: '' },
    Thursday: { from: '', to: '' },
    Friday: { from: '', to: '' },
    Saturday: { from: '', to: '' },
    Sunday: { from: '', to: '' },
  });
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [vacationMessage, setVacationMessage] = useState('');
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');

  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching data

  // Fetch baker profile data on component mount
  useEffect(() => {
    const fetchBakerProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get('/api/baker/profile', config);
        setBakerName(data.name || '');
        setBakeryName(data.bakeryName || '');
        setPhoneNumber(data.phone || '');
        setDescription(data.bio || '');
        setSpecialties(data.specialties ? data.specialties.join(', ') : ''); // Convert array to string
        setPriceRange(data.priceRange || '');
        setLocation(data.location || '');
        setConstructorOptions(data.constructorOptions || '');
        setCurrentPhotoUrl(data.image || ''); // Set current photo URL
        // Populate gallery images
        setGalleryImages(data.gallery ? data.gallery.map(url => ({ id: url, url: url, file: null })) : []);
        // Populate availability
        setMaxOrdersPerDay(data.maxOrdersPerDay || 0);
        setWorkingHours(data.workingHours || {
          Monday: { from: '', to: '' }, Tuesday: { from: '', to: '' }, Wednesday: { from: '', to: '' },
          Thursday: { from: '', to: '' }, Friday: { from: '', to: '' }, Saturday: { from: '', to: '' },
          Sunday: { from: '', to: '' },
        });
        setIsVacationMode(data.isVacationMode || false);
        setVacationMessage(data.vacationMessage || '');
        setVacationStartDate(data.vacationStartDate ? data.vacationStartDate.split('T')[0] : ''); // Format date for input
        setVacationEndDate(data.vacationEndDate ? data.vacationEndDate.split('T')[0] : ''); // Format date for input
      } catch (error) {
        console.error('Error fetching baker profile:', error);
        toast.error('Failed to load baker profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBakerProfile();
  }, [token]); // Re-fetch if token changes

  const handleViewPublicProfile = () => {
    if (user && user.id) {
      navigate(`/bakers/${user.id}`);
    } else {
      toast.error('Baker ID not found. Cannot view public profile.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setCurrentPhotoUrl(URL.createObjectURL(file)); // Show preview of new photo
    }
  };

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: URL.createObjectURL(file), // Temporary ID for preview
      url: URL.createObjectURL(file),
      file: file, // Store the actual file for upload
    }));
    setGalleryImages(prevImages => [...prevImages, ...newImages]);
  };

  const handleDeleteImage = (id) => {
    setGalleryImages(prevImages => prevImages.filter(image => image.id !== id));
  };

  const handleSaveChanges = async (section) => {
    setIsLoading(true); // Set loading for saving
    try {
      const formData = new FormData();
      // Always append basic info fields, as backend expects them
      formData.append('name', bakerName);
      formData.append('bakeryName', bakeryName);
      formData.append('phone', phoneNumber);
      formData.append('bio', description);
      formData.append('specialties', JSON.stringify(specialties.split(',').map(s => s.trim())));
      formData.append('priceRange', priceRange);
      formData.append('location', location);
      formData.append('constructorOptions', constructorOptions);

      if (photo) {
        formData.append('image', photo); // Append the actual file for profile image
      }

      // Append gallery images
      const existingUrls = galleryImages.filter(img => !img.file).map(img => img.url);
      formData.append('existingGalleryImages', JSON.stringify(existingUrls));

      galleryImages.filter(img => img.file).forEach((imgFile, index) => {
        formData.append(`galleryImages`, imgFile.file);
      });

      // Append availability fields
      formData.append('maxOrdersPerDay', maxOrdersPerDay);
      formData.append('workingHours', JSON.stringify(workingHours));
      formData.append('isVacationMode', isVacationMode);
      formData.append('vacationMessage', vacationMessage);
      formData.append('vacationStartDate', vacationStartDate);
      formData.append('vacationEndDate', vacationEndDate);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put('/api/baker/profile', formData, config);
      setUserData({ user: data, token: token }); // Update user store with new data
      // Update local state with new data from backend
      setBakerName(data.name || '');
      setBakeryName(data.bakeryName || '');
      setPhoneNumber(data.phone || '');
      setDescription(data.bio || '');
      setSpecialties(data.specialties ? data.specialties.join(', ') : '');
      setPriceRange(data.priceRange || '');
      setLocation(data.location || '');
      setConstructorOptions(data.constructorOptions || '');
      setCurrentPhotoUrl(data.image || '');
      setGalleryImages(data.gallery ? data.gallery.map(url => ({ id: url, url: url, file: null })) : []);
      setPhoto(null); // Clear selected new photo after successful upload
      setMaxOrdersPerDay(data.maxOrdersPerDay || 0);
      setWorkingHours(data.workingHours || {
        Monday: { from: '', to: '' }, Tuesday: { from: '', to: '' }, Wednesday: { from: '', to: '' },
        Thursday: { from: '', to: '' }, Friday: { from: '', to: '' }, Saturday: { from: '', to: '' },
        Sunday: { from: '', to: '' },
      });
      setIsVacationMode(data.isVacationMode || false);
      setVacationMessage(data.vacationMessage || '');
      setVacationStartDate(data.vacationStartDate ? data.vacationStartDate.split('T')[0] : '');
      setVacationEndDate(data.vacationEndDate ? data.vacationEndDate.split('T')[0] : '');

      toast.success(`${section} updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      toast.error(`Failed to update ${section}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableAccount = () => {
    if (window.confirm('Are you sure you want to temporarily disable your account?')) {
      console.log('Account temporarily disabled');
      // Implement API call to disable account
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      console.log('Account deleted');
      // Implement API call to delete account
    }
  };

  return (
    <div className="baker-profile-settings">
      <h2>Baker Profile Settings</h2>

      {/* View Public Profile Button */}
      <div className="baker-profile-settings__public-profile">
        <button className="btn-primary" onClick={handleViewPublicProfile}>
          View Public Profile
        </button>
      </div>

      {/* Basic Info Section */}
      <section className="baker-profile-settings__section">
        <h3>Basic Information</h3>
        <div className="form-group">
          <label htmlFor="bakerName">Name:</label>
          <input
            type="text"
            id="bakerName"
            value={bakerName}
            onChange={(e) => setBakerName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="bakeryName">Bakery Name:</label>
          <input
            type="text"
            id="bakeryName"
            value={bakeryName}
            onChange={(e) => setBakeryName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="specialties">Specialties/Hashtags:</label>
          <input
            type="text"
            id="specialties"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="e.g., #vegan #glutenfree"
          />
        </div>
        <div className="form-group">
          <label htmlFor="priceRange">Price Range:</label>
          <input
            type="text"
            id="priceRange"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g., $-$$"
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="constructorOptions">Constructor Options:</label>
          <textarea
            id="constructorOptions"
            value={constructorOptions}
            onChange={(e) => setConstructorOptions(e.target.value)}
            placeholder="Describe custom cake options"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="photoUpload">Photo Upload:</label>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
          {photo && <p>Selected file: {photo.name}</p>}
        </div>
        <button className="btn-primary" onClick={() => handleSaveChanges('basicInfo')}>
          Save Basic Info
        </button>
      </section>

      {/* Gallery Section */}
      <section className="baker-profile-settings__section">
        <h3>Gallery</h3>
        <div className="form-group">
          <label htmlFor="galleryUpload">Add Image:</label>
          <input
            type="file"
            id="galleryUpload"
            accept="image/*"
            multiple
            onChange={handleAddImage}
          />
          <p className="tip-text">Tip: Upload high-quality images of your work!</p>
        </div>
        <div className="gallery-images">
          {galleryImages.length === 0 ? (
            <p>No images added yet.</p>
          ) : (
            galleryImages.map((image) => (
              <div key={image.id} className="gallery-image-item">
                <img src={image.url} alt="Gallery" />
                <button className="btn-delete" onClick={() => handleDeleteImage(image.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
        <button className="btn-primary" onClick={() => handleSaveChanges('gallery')}>
          Save Gallery
        </button>
      </section>

      {/* Availability Section */}
      <section className="baker-profile-settings__section">
        <h3>Availability</h3>
        <div className="form-group">
          <label htmlFor="maxOrdersPerDay">Maximum Orders Per Day:</label>
          <input
            type="number"
            id="maxOrdersPerDay"
            value={maxOrdersPerDay}
            onChange={(e) => setMaxOrdersPerDay(e.target.value)}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Working Hours (Weekdays):</label>
          {Object.keys(workingHours).map((day) => (
            <div key={day} className="working-hours-item">
              <span>{day}:</span>
              <input
                type="time"
                value={workingHours[day].from}
                onChange={(e) => setWorkingHours({ ...workingHours, [day]: { ...workingHours[day], from: e.target.value } })}
              />
              <span> to </span>
              <input
                type="time"
                value={workingHours[day].to}
                onChange={(e) => setWorkingHours({ ...workingHours, [day]: { ...workingHours[day], to: e.target.value } })}
              />
            </div>
          ))}
        </div>
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="vacationMode"
            checked={isVacationMode}
            onChange={(e) => setIsVacationMode(e.target.checked)}
          />
          <label htmlFor="vacationMode">Vacation Mode</label>
        </div>
        {isVacationMode && (
          <>
            <div className="form-group">
              <label htmlFor="vacationMessage">Vacation Message:</label>
              <textarea
                id="vacationMessage"
                value={vacationMessage}
                onChange={(e) => setVacationMessage(e.target.value)}
                placeholder="e.g., I'm on vacation until..."
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="vacationStartDate">Vacation Start Date:</label>
              <input
                type="date"
                id="vacationStartDate"
                value={vacationStartDate}
                onChange={(e) => setVacationStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vacationEndDate">Vacation End Date:</label>
              <input
                type="date"
                id="vacationEndDate"
                value={vacationEndDate}
                onChange={(e) => setVacationEndDate(e.target.value)}
              />
            </div>
          </>
        )}
        <p className="tip-text">Tip: Set your availability to manage orders effectively.</p>
        <button className="btn-primary" onClick={() => handleSaveChanges('availability')}>
          Save Availability
        </button>
      </section>

      {/* More Settings Section */}
      <section className="baker-profile-settings__section">
        <h3>More Settings</h3>
        <button className="btn-secondary" onClick={handleDisableAccount}>
          Temporarily Disable Account
        </button>
        <button className="btn-danger" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default BakerProfileSettings;
