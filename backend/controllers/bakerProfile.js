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
            existingGalleryImages,
            maxOrdersPerDay,
            workingHours,
            isVacationMode,
            vacationMessage,
            vacationStartDate,
            vacationEndDate,
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
        user.specialties = specialties ? JSON.parse(specialties) : user.specialties; // Specialties might come as JSON string
        user.priceRange = priceRange || user.priceRange;
        user.location = location || user.location;
        user.constructorOptions = constructorOptions || user.constructorOptions;
        
        if (newProfileImage) {
            user.image = newProfileImage;
        }
        
        // Handle gallery images
        let updatedGallery = [];
        if (existingGalleryImages) {
            // existingGalleryImages will be a JSON string if multiple, or a string if single
            const parsedExisting = typeof existingGalleryImages === 'string' ? JSON.parse(existingGalleryImages) : existingGalleryImages;
            updatedGallery = [...parsedExisting];
        }
        user.gallery = [...updatedGallery, ...newGalleryImages]; // Combine existing and new gallery images
        
        // Handle availability fields
        user.maxOrdersPerDay = maxOrdersPerDay !== undefined ? maxOrdersPerDay : user.maxOrdersPerDay;
        user.workingHours = workingHours ? JSON.parse(workingHours) : user.workingHours; // workingHours might come as JSON string
        user.isVacationMode = isVacationMode !== undefined ? isVacationMode : user.isVacationMode;
        user.vacationMessage = vacationMessage || user.vacationMessage;
        user.vacationStartDate = vacationStartDate ? new Date(vacationStartDate) : user.vacationStartDate;
        user.vacationEndDate = vacationEndDate ? new Date(vacationEndDate) : user.vacationEndDate;
        
        const updatedUser = await user.save();        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getBakerProfile, updateBakerProfile, upload };
