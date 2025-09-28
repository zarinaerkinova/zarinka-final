import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../../config/axios.js'
import { useProductStore } from '../../store/Product.js'
import { useUserStore } from '../../store/User.js'
import './AddProduct.scss'

const AddProduct = () => {
	const { createProduct, fetchProducts, fetchProductsByBaker } =
		useProductStore()
	const { userInfo } = useUserStore()
	const navigate = useNavigate()
	const [step, setStep] = useState(1)

	const [form, setForm] = useState({
		name: '',
		price: '',
		description: '',
		category: '',
		image: '', // For preview
		imageFile: null, // For upload
		ingredients: [],
		sizes: [],
		preparationTime: '',
	})

	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const { data } = await api.get('/categories')
				setCategories(data.data || [])
			} catch (err) {
				console.error(err)
				toast.error('Failed to load categories')
			}
		}
		fetchCategories()
	}, [])

	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setForm(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	const handleSizeChange = (index, field, value) => {
		const newSizes = [...form.sizes]
		newSizes[index][field] = value
		setForm(prev => ({ ...prev, sizes: newSizes }))
	}

	const addSize = () => {
		setForm(prev => ({
			...prev,
			sizes: [...prev.sizes, { label: '', price: '' }],
		}))
	}

	const removeSize = index => {
		setForm(prev => ({
			...prev,
			sizes: prev.sizes.filter((_, i) => i !== index),
		}))
	}

	const handleIngredientChange = (index, value) => {
		const newIngredients = [...form.ingredients]
		newIngredients[index] = value
		setForm({ ...form, ingredients: newIngredients })
	}

	const addIngredient = () => {
		setForm({ ...form, ingredients: [...form.ingredients, ''] })
	}

	const removeIngredient = index => {
		const newIngredients = [...form.ingredients]
		newIngredients.splice(index, 1)
		setForm({ ...form, ingredients: newIngredients })
	}

	const handleFileChange = e => {
		const file = e.target.files[0]
		if (file) {
			setForm(prev => ({
				...prev,
				image: URL.createObjectURL(file),
				imageFile: file,
			}))
		}
	}

	const isStepComplete = step => {
		switch (step) {
			case 1:
				return form.name && form.description && form.category && form.imageFile
			case 2:
				return (
					form.price &&
					(form.sizes.length === 0 || form.sizes.every(s => s.label && s.price))
				)
			case 3:
				return (
					form.ingredients.length > 0 &&
					form.ingredients.every(i => i.trim()) &&
					form.preparationTime.trim()
				)
			default:
				return false
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()

		if (!isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)) {
			return toast.error('❌ Please fill all fields in all steps')
		}

		setLoading(true)

		try {
			const formData = new FormData()
			formData.append('name', form.name)
			formData.append('price', form.price)
			formData.append('description', form.description)
			formData.append('category', form.category)
			formData.append('image', form.imageFile)
			formData.append('preparationTime', form.preparationTime)

			formData.append('ingredients', form.ingredients.join(','))
			formData.append('sizes', JSON.stringify(form.sizes))

			const token = localStorage.getItem('token')

			const { success, message } = await createProduct(formData, token)

			if (success) {
				toast.success('✅ Product added successfully!')
				// Refresh product lists to show the new product
				await fetchProducts() // Refresh general products list for Browse Cakes
				// Refresh baker products for Manage Products
				if (userInfo?._id) {
					await fetchProductsByBaker(userInfo._id)
				}
			} else {
				toast.error(`❌ ${message}`)
			}
			navigate('/profile') // Unconditional navigation as requested
		} catch (err) {
			console.error('Submission error:', err)
			toast.error('❌ Failed to add product')
		} finally {
			setLoading(false)
		}
	}

	const nextStep = () => setStep(prev => prev + 1)
	const prevStep = () => setStep(prev => prev - 1)

	return (
		<main className='edit-product-main'>
			<div className='container_add'>
				<form className='form' onSubmit={handleSubmit}>
					<h1 className='title_product_add'>Add New Cake</h1>

					<div className='step-indicator'>
						<span
							className={step === 1 ? 'active' : ''}
							onClick={() => setStep(1)}
						>
							1. Basic Info
						</span>
						<span
							className={step === 2 ? 'active' : ''}
							onClick={() => setStep(2)}
						>
							2. Pricing & Sizes
						</span>
						<span
							className={step === 3 ? 'active' : ''}
							onClick={() => setStep(3)}
						>
							3. Details
						</span>
					</div>

					{step === 1 && (
						<div className='form-step'>
							<input
								type='text'
								name='name'
								value={form.name}
								onChange={handleChange}
								placeholder='Cake Name'
								required
							/>
							<textarea
								name='description'
								value={form.description}
								onChange={handleChange}
								placeholder='Description'
								required
							/>
							<select
								name='category'
								value={form.category}
								onChange={handleChange}
								required
							>
								<option value=''>-- Select Category --</option>
								{categories.map(cat => (
									<option key={cat._id || cat.id} value={cat._id || cat.id}>
										{cat.name}
									</option>
								))}
							</select>
							<input
								type='file'
								accept='image/*'
								onChange={handleFileChange}
								required
							/>
							{form.image && (
								<div className='image-preview'>
									<img
										src={form.image}
										alt='Preview'
										className='preview-image'
									/>
								</div>
							)}
						</div>
					)}

					{step === 2 && (
						<div className='form-step'>
							<input
								type='number'
								name='price'
								min='1'
								value={form.price}
								onChange={handleChange}
								placeholder='Base Price'
								required
							/>
							<h4>Sizes</h4>
							{form.sizes.map((size, idx) => (
								<div key={idx} className='size-input'>
									<input
										type='text'
										placeholder='Label (e.g. Small)'
										value={size.label}
										onChange={e =>
											handleSizeChange(idx, 'label', e.target.value)
										}
										required
									/>
									<input
										type='number'
										placeholder='Price'
										min='1'
										value={size.price}
										onChange={e =>
											handleSizeChange(idx, 'price', e.target.value)
										}
										required
									/>
									<button
										type='button'
										onClick={() => removeSize(idx)}
										className='remove-size-btn'
									>
										-
									</button>
								</div>
							))}
							<button type='button' className='add-size-btn' onClick={addSize}>
								+ Add Size
							</button>
						</div>
					)}

					{step === 3 && (
						<div className='form-step'>
							<h4>Ingredients</h4>
							{form.ingredients.length === 0 && (
								<p className='no-ingredients'>Add at least one ingredient</p>
							)}
							{form.ingredients.map((ingredient, index) => (
								<div key={index} className='ingredient-input'>
									<input
										type='text'
										placeholder='Ingredient'
										value={ingredient}
										onChange={e =>
											handleIngredientChange(index, e.target.value)
										}
										required
									/>
									<button
										onClick={() => removeIngredient(index)}
										className='remove-ingredient-btn'
									>
										-
									</button>
								</div>
							))}
							<button onClick={addIngredient} className='add-ingredient-btn'>
								+ Add Ingredient
							</button>
							<input
								type='text'
								name='preparationTime'
								value={form.preparationTime}
								onChange={handleChange}
								placeholder='Preparation Time (e.g., 2 hours, 1 day)'
								required
							/>
						</div>
					)}

					<div className='form-navigation'>
						{step > 1 && (
							<button type='button' onClick={prevStep}>
								Back
							</button>
						)}
						{step < 3 && (
							<button
								type='button'
								onClick={nextStep}
								disabled={!isStepComplete(step)}
							>
								Next
							</button>
						)}
					</div>

					<div className='form-actions'>
						{step === 3 && (
							<button
								type='submit'
								className='save-btn'
								disabled={
									loading ||
									!isStepComplete(1) ||
									!isStepComplete(2) ||
									!isStepComplete(3)
								}
							>
								{loading ? 'Adding...' : 'Add Cake'}
							</button>
						)}
						<button
							type='button'
							className='cancel-btn'
							onClick={() => navigate('/profile')}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</main>
	)
}

export default AddProduct
