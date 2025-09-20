import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Product from "../models/Product.js";


export const user = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) return res.status(404).json({ msg: 'User not found' })

        // If the user is a baker (role 'admin'), calculate their average product rating
        if (user.role === 'admin') {
            const products = await Product.find({ createdBy: user._id });
            let totalRating = 0;
            let ratingCount = 0;

            products.forEach(product => {
                if (product.rating && product.rating.count > 0) {
                    totalRating += product.rating.average * product.rating.count;
                    ratingCount += product.rating.count;
                }
            });

            const averageRating = ratingCount > 0 ? (totalRating / ratingCount) : 0;
            user._doc.rating = averageRating; // Add rating to the user object
        }

        res.json(user)
    } catch (error) {
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
}

export const bakers = async (req, res) => {
    try {
        const bakers = await User.find({ role: 'admin' }).select('-password').lean();
        if (bakers.length === 0) {
            return res.status(404).json({ msg: 'No bakers found' });
        }

        for (let baker of bakers) {
            // Use the rating and numReviews directly from the User model
            baker.rate = baker.rating; // Assign the stored rating to 'rate' for frontend compatibility
            baker.raters = baker.numReviews; // Assign the stored numReviews to 'raters'
        }

        res.json(bakers);
    } catch (error) {
        console.error('Error fetching bakers:', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

export const baker = async (req, res) => {
    const { bakerId } = req.params;
    try {
        const products = await Product.find({ baker: bakerId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
}

export const getBakerById = async (req, res) => {
    const { id } = req.params;
    try {
        const baker = await User.findById(id).select('-password');
        if (!baker) return res.status(404).json({ message: 'Baker not found' });
        res.json(baker);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const register = async (req, res) => {
    const { name, email, password, role, bio, phone } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png';

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        user = new User({ name, email, password, role, image, bio, phone });
        console.log('Register: User object before saving:', user);
        
        try {
            const savedUser = await user.save();
            console.log('Register: User saved successfully:', savedUser);
        } catch (saveError) {
            console.error('Register save error:', saveError);
            return res.status(400).json({ success: false, msg: saveError.message || 'Validation failed' });
        }

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        const userData = {
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            bio: user.bio,
            phone: user.phone,
            image: user.image,
            _id: user._id,
        };

        res.json({ success: true, token, userData });
    } catch (error) {
        console.error('Register error (outer catch):', error);
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};


// export const login = async (req, res) => {
//     const { email, password } = req.body
//     try {
//         const user = await User.findOne({ email })
//         if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

//         const isMatch = await bcrypt.compare(password, user.password)
//         if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' })

//         const payload = { userId: user.id }
//         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

//         res.json({ success: true, token, userData: { name: user.name, email: user.email, role: user.role } })
//     } catch (error) {
//         return res.status(500).json({ success: false, msg: 'Server error' });
//     }
// }

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        console.log('Login: User found by email:', user);
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Login: Password match result:', isMatch);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('Login: Generated token:', token);

        // Ensure role exists, defaulting to 'user' if not present
        const userData = {
            name: user.name,
            email: user.email,
            role: user.role || 'user',  // Default to 'user' if no role is assigned
        };

        res.json({
            success: true,
            token,
            userData,
        });
    } catch (error) {
        console.error('Login error:', error); // Add more logging to identify issues
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        console.log('Update Profile Request Body:', req.body);
        console.log('Update Profile Request File:', req.file);

        const { name, email, phone, bio, bakeryName } = req.body;
        const userId = req.user.id;
        console.log('User ID from token:', userId);

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('User found before update:', user);

        // Update fields if provided
        if (name) user.name = name;
        if (bakeryName) user.bakeryName = bakeryName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (bio) user.bio = bio;

        // Update image if uploaded
        if (req.file) {
            user.image = `/uploads/${req.file.filename}`;
        }
        console.log('User object before saving:', user);

        // Save the updated user
        try {
            await user.save();
            console.log('User saved successfully:', user);
        } catch (saveError) {
            console.error('Error saving user:', saveError);
            return res.status(500).json({ success: false, message: 'Error saving profile changes' });
        }

        // Return updated user data (without password)
        const userData = {
            _id: user._id,
            name: user.name,
            bakeryName: user.bakeryName,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            image: user.image,
            role: user.role,
        };

        res.json({ success: true, message: 'Profile updated successfully', userData });
    } catch (error) {
        console.error('Update profile error (outer catch):', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};