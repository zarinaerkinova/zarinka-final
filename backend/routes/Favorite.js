import express from "express";
import { addFavorite, removeFavorite, getFavorites, addBakerFavorite, removeBakerFavorite, getBakerFavorites } from "../controllers/Favorite.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Product Favorites
router.get("/", auth, getFavorites);
router.post("/", auth, addFavorite);
router.delete("/:productId", auth, removeFavorite);

// Baker Favorites
router.get("/bakers", auth, getBakerFavorites);
router.post("/bakers", auth, addBakerFavorite);
router.delete("/bakers/:bakerId", auth, removeBakerFavorite);

export default router;