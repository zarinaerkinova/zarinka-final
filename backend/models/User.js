import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    bakeryName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'baker'], // Added 'baker' role
        default: 'user',
        required: true,
    },
    image: {
        type: String,
        default: '/uploads/default.png',
    },
    phone: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: 'Я пекарь',
    },
    specialties: {
        type: [String], // Array of strings for specialties/hashtags
        default: [],
    },
    priceRange: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    constructorOptions: {
        type: String,
        default: '',
    },
    gallery: {
        type: [String], // Array of image URLs for the gallery
        default: [],
    },
    maxOrdersPerDay: {
        type: Number,
        default: 0,
    },
    workingHours: {
        type: Object,
        default: {
            Monday: { from: '', to: '' },
            Tuesday: { from: '', to: '' },
            Wednesday: { from: '', to: '' },
            Thursday: { from: '', to: '' },
            Friday: { from: '', to: '' },
            Saturday: { from: '', to: '' },
            Sunday: { from: '', to: '' },
        },
    },
    isVacationMode: {
        type: Boolean,
        default: false,
    },
    vacationMessage: {
        type: String,
        default: '',
    },
    vacationStartDate: {
        type: Date,
    },
    vacationEndDate: {
        type: Date,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
})

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
})

const User = mongoose.model('User', UserSchema)
export default User