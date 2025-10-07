import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Review from '../models/Review.js';

// Get all products with optional filtering
export const getProducts = async (req, res) => {
	try {
		const { search, minPrice, maxPrice, ingredients, minRating, category, isAvailable, createdBy } =
			req.query
		let query = {}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			]
		}

		if (minPrice || maxPrice) {
			query.price = {}
			if (minPrice) query.price.$gte = parseFloat(minPrice)
			if (maxPrice) query.price.$lte = parseFloat(maxPrice)
		}

		if (ingredients) {
			// Assuming ingredients come as a comma-separated string
			const ingredientsArray = ingredients.split(',').map(ing => ing.trim())
			query.ingredients = { $in: ingredientsArray }
		}

		if (minRating) {
			query['rating.average'] = { $gte: parseFloat(minRating) }
		}

		if (category) {
			if (!mongoose.Types.ObjectId.isValid(category)) {
				return res
					.status(400)
					.json({ success: false, message: 'Invalid category ID' })
			}
			query.category = category
		}

		if (isAvailable !== undefined) {
			query.isAvailable = isAvailable === 'true'; // Convert string to boolean
		}

		if (createdBy) {
			if (!mongoose.Types.ObjectId.isValid(createdBy)) {
				return res.status(400).json({ success: false, message: 'Invalid creator ID' });
			}
			query.createdBy = createdBy;
		}

		const products = await Product.find(query)
			.populate('category', 'name')
			.populate('createdBy', 'name email bio image')
            .lean();

        for (let product of products) {
            const reviews = await Review.find({ product: product._id });
            product.reviewCount = reviews.length;
        }

		res.status(200).json({ success: true, data: products })
	} catch (error) {
		console.error('Error fetching products:', error.message)
		res
			.status(500)
			.json({ success: false, message: 'Server error while fetching products' })
	}
}

// Get single product
export const getProductById = async (req, res) => {
	try {
		const { id } = req.params

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid Product Id' })
		}

		const product = await Product.findById(id)
			.populate('category', 'name')
			.populate('createdBy', 'name email bio image')

		if (!product) {
			return res
				.status(404)
				.json({ success: false, message: 'Product not found' })
		}

		res.status(200).json({ success: true, data: product })
	} catch (error) {
		console.error('Error fetching product:', error.message)
		res
			.status(500)
			.json({ success: false, message: 'Server error while fetching product' })
	}
}

// Get products by baker
export const getBakerProducts = async (req, res) => {
	const { bakerId } = req.params
	try {
		// Match how products are created: they store the creator in `createdBy`
		const products = await Product.find({ createdBy: bakerId })
			.populate('category', 'name')
			.populate('createdBy', 'name email')
		res.json(products)
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Failed to fetch products for baker' })
	}
}

// Create product
export const createProduct = async (req, res) => {
	try {
		const {
			name,
			price,
			description,
			category,
			preparationTime,
		} = req.body

		let { ingredients, sizes } = req.body;

		if (!name || !price || !description || !category) {
			return res
				.status(400)
				.json({ success: false, message: 'Please provide all required product fields' })
		}

		if (!mongoose.Types.ObjectId.isValid(category)) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid category ID' })
		}

		if (!req.file) {
			return res
				.status(400)
				.json({ success: false, message: 'Product image is required' })
		}

		// Parse ingredients and sizes from string to array
		if (typeof ingredients === 'string') {
			ingredients = ingredients.split(',').map(item => item.trim()).filter(i => i);
		}

		if (typeof sizes === 'string') {
			if (sizes) {
				try {
					sizes = JSON.parse(sizes);
				} catch (error) {
					return res.status(400).json({ success: false, message: 'Invalid sizes format' });
				}
			} else {
				sizes = [];
			}
		}

		const product = new Product({
			name,
			price,
			image: `/uploads/${req.file.filename}`,
			description,
			category,
			createdBy: req.user._id,
			ingredients,
			sizes,
			preparationTime,
		});

		await product.save();

		const populatedProduct = await Product.findById(product._id)
			.populate('category', 'name')
			.populate('createdBy', 'name email bio image');

		res.status(201).json({ success: true, product: populatedProduct });

	} catch (error) {
		console.error('❌ Create product error:', error);
		if (error.name === 'ValidationError') {
			return res.status(400).json({ success: false, message: error.message });
		}
		res.status(500).json({ success: false, message: 'Server error: ' + error.message });
	}
};

// Update product
export const updateProduct = async (req, res) => {
	const { id } = req.params
	let productData = req.body

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res
			.status(400)
			.json({ success: false, message: 'Invalid Product Id' })
	}

		try {
		if (req.file) {
			productData.image = `/uploads/${req.file.filename}`
		}

		// Coerce ingredients to array if submitted as string/JSON via multipart form
		if (productData.ingredients) {
			if (typeof productData.ingredients === 'string') {
				try {
					const parsed = JSON.parse(productData.ingredients)
					if (Array.isArray(parsed)) {
						productData.ingredients = parsed
					} else {
						productData.ingredients = String(productData.ingredients)
							.split(',')
							.map(s => s.trim())
							.filter(Boolean)
					}
				} catch {
					productData.ingredients = String(productData.ingredients)
						.split(',')
						.map(s => s.trim())
						.filter(Boolean)
				}
			}
		}

		// Coerce sizes to array if submitted as string/JSON via multipart form
		if (productData.sizes) {
			if (typeof productData.sizes === 'string') {
				try {
					const parsed = JSON.parse(productData.sizes)
					if (Array.isArray(parsed)) {
						productData.sizes = parsed
					}
				} catch {
					// ignore if parsing fails
				}
			}
		}

		if (
			productData.category &&
			!mongoose.Types.ObjectId.isValid(productData.category)
		) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid category ID' })
		}

		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			{
				...productData,
				ingredients: productData.ingredients || [],
				sizes: productData.sizes || [],
				orderCount: productData.orderCount ?? 0,
				rating: productData.rating || { average: 0, count: 0 },
			},
			{ new: true }
		)
			.populate('category', 'name')
			.populate('createdBy', 'name email bio image')

		if (!updatedProduct) {
			return res
				.status(404)
				.json({ success: false, message: 'Product not found' })
		}
		res.status(200).json({ success: true, data: updatedProduct })
	} catch (error) {
		console.error('Update product error:', error)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}

// Delete product
export const deleteProduct = async (req, res) => {
	const { id } = req.params

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res
			.status(400)
			.json({ success: false, message: 'Invalid Product Id' })
	}

		try {
		const deletedProduct = await Product.findByIdAndDelete(id)
		if (!deletedProduct) {
			return res
				.status(404)
				.json({ success: false, message: 'Product not found' })
		}
		res.status(200).json({ success: true, message: 'Product deleted' })
	} catch (error) {
		console.error('Delete product error:', error)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}

// Get products by category
export const getProductsByCategory = async (req, res) => {
		try {
		const { categoryId } = req.params

		if (!mongoose.Types.ObjectId.isValid(categoryId)) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid category ID' })
		}

		const products = await Product.find({ category: categoryId })
			.populate('category', 'name')
			.populate('createdBy', 'name email bio image')
		res.status(200).json({ success: true, data: products })
	} catch (error) {
		console.error('Error fetching products by category:', error.message)
		res.status(500).json({
			success: false,
			message: 'Server error while fetching products by category',
		})
	}
}

export const getProductCounts = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({});
        const availableProducts = await Product.countDocuments({ isAvailable: true });

        res.status(200).json({ success: true, data: { totalProducts, availableProducts } });
    } catch (error) {
        console.error('Error fetching product counts:', error.message);
        res.status(500).json({ success: false, message: 'Server error while fetching product counts' });
    }
};