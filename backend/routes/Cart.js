import express from 'express';
import { auth } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from '../controllers/Cart.js';

const router = express.Router();

router.get("/", auth, getCart);
router.post("/", auth, addToCart);
router.put("/:cartItemId", auth, updateCartItemQuantity);
router.delete("/:cartItemId", auth, removeFromCart);

export default router;
