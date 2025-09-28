import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

// @desc    Get baker profile
// @route   GET /api/baker/profile
// @access  Private (Baker/Admin)
const getBakerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update baker profile
// @route   PUT /api/baker/profile
// @access  Private (Baker/Admin)
const updateBakerProfile = async (req, res) => {
    try {
        const {
            name,
            bakeryName,
            phone,
            bio,
            specialties,
            priceRange,
            location,
            constructorOptions,
            workingHours,
            orderSettings,
            vacationMode,
            vacationDetails,
            unavailableDates,
            busyDates,
            existingGalleryImages,
        } = req.body;
        const newProfileImage = req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
        const newGalleryImages = req.files && req.files.galleryImages ? req.files.galleryImages.map(file => `/uploads/${file.filename}`) : [];
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update fields
        user.name = name || user.name;
        user.bakeryName = bakeryName || user.bakeryName;
        user.phone = phone || user.phone;
        user.bio = bio || user.bio;
        if (specialties) user.specialties = specialties.split(',').map(s => s.trim());
        user.priceRange = priceRange || user.priceRange;
        user.location = location || user.location;
        user.constructorOptions = constructorOptions || user.constructorOptions;

        if (workingHours) user.workingHours = JSON.parse(workingHours);
        if (orderSettings) user.orderSettings = JSON.parse(orderSettings);
        if (vacationMode) user.vacationMode = JSON.parse(vacationMode);
        if (vacationDetails) user.vacationDetails = JSON.parse(vacationDetails);
        if (unavailableDates) user.unavailableDates = JSON.parse(unavailableDates);
        if (busyDates) user.busyDates = JSON.parse(busyDates);
        
        if (newProfileImage) {
            user.image = newProfileImage;
        }
        
        // Handle gallery images
        let updatedGallery = [];
        if (existingGalleryImages) {
            try {
                const parsedExisting = JSON.parse(existingGalleryImages);
                updatedGallery = Array.isArray(parsedExisting) ? parsedExisting : [parsedExisting];
            } catch (error) {
                // If parsing fails, it might be a single string URL
                updatedGallery = [existingGalleryImages];
            }
        }
        
        if (newGalleryImages && newGalleryImages.length > 0) {
            user.gallery = [...updatedGallery, ...newGalleryImages];
        } else {
            user.gallery = updatedGallery;
        }
        
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getBakerProfile, updateBakerProfile, upload };
