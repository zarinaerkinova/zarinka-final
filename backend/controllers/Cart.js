import Cart from '../models/Cart.js';
import Product from '../models/Product.js'; // Assuming Product model is needed for population

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.json([]); // Return empty array if cart doesn't exist
        }

        // Populate items.product
        await cart.populate('items.product');

        // Filter out items where product was supposed to be populated but is null (meaning product was deleted)
        // And also handle custom cakes
        cart.items = cart.items.filter(item => {
            // If it's a custom cake (no product reference), keep it
            if (!item.product) {
                // Ensure it has name and price to be considered a valid custom cake
                return item.name && item.price;
            }
            // If it's a regular product, and it was successfully populated, keep it
            return item.product !== null;
        });

        // Save the cart to remove any invalid items (deleted products or malformed custom cakes)
        await cart.save();

        // Now, prepare the response for the frontend
        const itemsForResponse = cart.items.map(item => {
            if (item.product) { // It's a regular product
                return item;
            } else { // It's a custom cake - DO NOT CREATE A PRODUCT OBJECT HERE
                // Return the item as is, with its name, price, etc.
                return item;
            }
        });

        res.json(itemsForResponse);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
    const { productId, name, price, quantity, selectedSize, customizedIngredients } = req.body;
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create new cart if it doesn't exist
            cart = new Cart({ user: userId, items: [] });
        }

        if (productId) {
            // Logic for regular products
            const existingItem = cart.items.find(item =>
                item.product &&
                item.product.toString() === productId &&
                JSON.stringify(item.selectedSize || null) === JSON.stringify(selectedSize || null) &&
                JSON.stringify(item.customizedIngredients || []) === JSON.stringify(customizedIngredients || [])
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity, selectedSize, customizedIngredients });
            }
        } else {
            // Logic for custom cakes
            cart.items.push({ name, price, quantity, selectedSize, customizedIngredients });
        }

        await cart.save();
        await getCart(req, res);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:cartItemId
// @access  Private
export const updateCartItemQuantity = async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemToUpdate = cart.items.id(cartItemId);

        if (!itemToUpdate) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        itemToUpdate.quantity = quantity;

        await cart.save();
        await getCart(req, res);
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:cartItemId
// @access  Private
export const removeFromCart = async (req, res) => {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemToRemove = cart.items.id(cartItemId);

        if (!itemToRemove) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items.pull(cartItemId);

        await cart.save();
        await getCart(req, res);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};