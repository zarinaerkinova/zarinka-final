import Favorite from "../models/Favorite.js";
import FavoriteBaker from "../models/FavoriteBaker.js";

// Add to favorites
export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID required" });

    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user.id, product: productId },
      { user: req.user.id, product: productId },
      { new: true, upsert: true } // create if not exist
    ).populate("product");

    res.json(favorite);
  } catch (err) {
    res.status(500).json({ message: "Error adding to favorites", error: err.message });
  }
};

// Remove from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    await Favorite.findOneAndDelete({ user: req.user.id, product: productId });

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ message: "Error removing favorite", error: err.message });
  }
};

// Get all favorites for logged-in user
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate("product");
    const validProducts = favorites.map(f => f.product).filter(product => product !== null);
    res.json(validProducts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching favorites", error: err.message });
  }
};

// Add a baker to favorites
export const addBakerFavorite = async (req, res) => {
    try {
        const { bakerId } = req.body;
        if (!bakerId) return res.status(400).json({ message: "Baker ID required" });

        const favorite = await FavoriteBaker.findOneAndUpdate(
            { user: req.user.id, baker: bakerId },
            { user: req.user.id, baker: bakerId },
            { new: true, upsert: true }
        ).populate("baker", "-password");

        res.json(favorite);
    } catch (err) {
        res.status(500).json({ message: "Error adding baker to favorites", error: err.message });
    }
};

// Remove a baker from favorites
export const removeBakerFavorite = async (req, res) => {
    try {
        const { bakerId } = req.params;
        await FavoriteBaker.findOneAndDelete({ user: req.user.id, baker: bakerId });
        res.json({ message: "Removed baker from favorites" });
    } catch (err) {
        res.status(500).json({ message: "Error removing baker from favorites", error: err.message });
    }
};

// Get all favorite bakers for logged-in user
export const getBakerFavorites = async (req, res) => {
    try {
        const favorites = await FavoriteBaker.find({ user: req.user.id }).populate("baker", "-password");
        const validBakers = favorites.map(f => f.baker).filter(baker => baker !== null);
        res.json(validBakers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching favorite bakers", error: err.message });
    }
};