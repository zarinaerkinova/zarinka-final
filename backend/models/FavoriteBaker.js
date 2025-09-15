import mongoose from 'mongoose';

const favoriteBakerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    baker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// To prevent duplicate entries
favoriteBakerSchema.index({ user: 1, baker: 1 }, { unique: true });

export default mongoose.model('FavoriteBaker', favoriteBakerSchema);
