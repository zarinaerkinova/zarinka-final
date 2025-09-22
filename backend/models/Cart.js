// models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false // Not required for custom cakes
    },
    name: {
        type: String,
        required: function() { return !this.product; } // Required if no product
    },
    price: {
        type: Number,
        required: function() { return !this.product; } // Required if no product
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    selectedSize: {
        type: {
            label: String,
            price: Number,
        },
        required: false,
    },
    customizedIngredients: {
        type: [{
            id: String,
            name: String,
            price: Number,
        }],
        default: [],
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

export default mongoose.model('Cart', cartSchema);