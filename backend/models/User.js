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
    orderSettings: {
        type: Object,
        default: {
            maxOrders: 10,
            leadTime: 48,
            autoAccept: true,
            acceptOnlyWorkingDays: true,
        },
    },
    workingHours: {
        type: Object,
        default: {
            monday: { enabled: true, from: '09:00', to: '17:00' },
            tuesday: { enabled: true, from: '09:00', to: '17:00' },
            wednesday: { enabled: true, from: '09:00', to: '17:00' },
            thursday: { enabled: true, from: '09:00', to: '17:00' },
            friday: { enabled: true, from: '09:00', to: '17:00' },
            saturday: { enabled: true, from: '10:00', to: '16:00' },
            sunday: { enabled: false, from: '', to: '' },
        },
    },
    vacationMode: {
        type: Boolean,
        default: false,
    },
    vacationDetails: {
        type: Object,
        default: {
            reason: '',
            from: '',
            to: '',
        },
    },
    unavailableDates: {
        type: [Date],
        default: [],
    },
    busyDates: {
        type: [Date],
        default: [],
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