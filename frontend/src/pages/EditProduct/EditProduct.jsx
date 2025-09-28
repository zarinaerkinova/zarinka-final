import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore } from '../../store/Product';
import { useUserStore } from '../../store/User';
import './EditProduct.scss'; // Assuming you have a corresponding SCSS file

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [product, setProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        ingredients: [],
        sizes: [],
        preparationTime: '',
        image: '',
    });
    const [initialProduct, setInitialProduct] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [message, setMessage] = useState({ error: '', success: '' });

    const { fetchCategories, categories } = useProductStore();
    const { user, token } = useUserStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();

                if (res.ok) {
                    const p = data.data;
                    setProduct({
                        name: p.name || '',
                        price: p.price || '',
                        description: p.description || '',
                        category: p.category?._id || '',
                        ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
                        sizes: Array.isArray(p.sizes) ? p.sizes : [],
                        preparationTime: p.preparationTime || '',
                        image: p.image || '',
                    });
                    setInitialProduct(p);
                } else {
                    setMessage({ error: 'Продукт не найден', success: '' });
                }
            } catch (error) {
                setMessage({ error: 'Ошибка загрузки продукта', success: '' });
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    useEffect(() => {
        if (!initialProduct) return;

        const productChanged =
            product.name !== initialProduct.name ||
            product.price !== initialProduct.price ||
            product.description !== initialProduct.description ||
            product.category !== initialProduct.category?._id ||
            product.preparationTime !== initialProduct.preparationTime;

        const ingredientsChanged = JSON.stringify(product.ingredients) !== JSON.stringify(initialProduct.ingredients);

        const sizesChanged = JSON.stringify(product.sizes) !== JSON.stringify(initialProduct.sizes);

        const imageChanged = newImage !== null;

        setIsDirty(productChanged || ingredientsChanged || sizesChanged || imageChanged);
    }, [product, newImage, initialProduct]);

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...product.sizes];
        newSizes[index][field] = value;
        setProduct({ ...product, sizes: newSizes });
    };

    const addSize = () => {
        setProduct({ ...product, sizes: [...product.sizes, { label: '', price: '' }] });
    };

    const removeSize = (index) => {
        const newSizes = [...product.sizes];
        newSizes.splice(index, 1);
        setProduct({ ...product, sizes: newSizes });
    };

    const handleIngredientChange = (index, value) => {
        const newIngredients = [...product.ingredients];
        newIngredients[index] = value;
        setProduct({ ...product, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setProduct({ ...product, ingredients: [...product.ingredients, ''] });
    };

    const removeIngredient = (index) => {
        const newIngredients = [...product.ingredients];
        newIngredients.splice(index, 1);
        setProduct({ ...product, ingredients: newIngredients });
    };

    const updateProduct = async () => {
        try {
            setMessage({ error: '', success: '' });

            if (!user || !token) {
                setMessage({ error: 'Пользователь не аутентифицирован.', success: '' });
                return;
            }

            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('price', product.price);
            formData.append('description', product.description);
            formData.append('category', product.category);
            formData.append('preparationTime', product.preparationTime);

            formData.append('ingredients', JSON.stringify(product.ingredients));
            formData.append('sizes', JSON.stringify(product.sizes));

            if (newImage) {
                formData.append('image', newImage);
            }

            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ success: 'Продукт успешно обновлен!', error: '' });
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            } else {
                setMessage({ error: data.message || 'Не удалось обновить продукт.', success: '' });
            }
        } catch (err) {
            console.error('Ошибка при обновлении продукта:', err);
            setMessage({ error: 'Произошла ошибка, попробуйте еще раз.', success: '' });
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <main className='edit-product-main'>
            <div className='container_add'>
                <div className='form'>
                    <h1 className='title_product_add'>Редактировать продукт</h1>

                    {message.error && <p className='error-message'>{message.error}</p>}
                    {message.success && <p className='success-message'>{message.success}</p>}

                    <div className="step-indicator">
                        <span className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>1. Основная информация</span>
                        <span className={step === 2 ? 'active' : ''} onClick={() => setStep(2)}>2. Цены и размеры</span>
                        <span className={step === 3 ? 'active' : ''} onClick={() => setStep(3)}>3. Детали</span>
                    </div>

                    {step === 1 && (
                        <div className="form-step">
                            <input type='text' placeholder='Название продукта' value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} />
                            <textarea placeholder='Описание продукта' value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })} />
                            <select value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })} required>
                                <option value=''>Выберите категорию</option>
                                {categories && categories.length > 0 ? (
                                    categories.map(category => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))
                                ) : (
                                    <option value='' disabled>Загрузка категорий...</option>
                                )}
                            </select>
                            {product.image && (
                                <div className="image-preview">
                                    <img src={`http://localhost:5000${product.image}`} alt='current' className="preview-image" />
                                </div>
                            )}
                            <input type='file' accept='image/*' onChange={e => setNewImage(e.target.files[0])} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-step">
                            <input type='number' min={1} placeholder='Базовая цена продукта' value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} />
                            
                            <h4>Размеры</h4>
                            {product.sizes.map((size, index) => (
                                <div key={index} className="size-input">
                                    <input type="text" placeholder="Название размера (напр. 1 кг)" value={size.label} onChange={(e) => handleSizeChange(index, 'label', e.target.value)} />
                                    <input type="number" placeholder="Цена для этого размера" value={size.price} onChange={(e) => handleSizeChange(index, 'price', e.target.value)} />
                                    <button onClick={() => removeSize(index)} className="remove-size-btn">Удалить</button>
                                </div>
                            ))}
                            <button onClick={addSize} className="add-size-btn">Добавить размер</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="form-step">
                            <h4>Ингредиенты</h4>
                            {product.ingredients.map((ingredient, index) => (
                                <div key={index} className="ingredient-input">
                                    <input type="text" placeholder="Ингредиент" value={ingredient} onChange={(e) => handleIngredientChange(index, e.target.value)} />
                                    <button onClick={() => removeIngredient(index)} className="remove-ingredient-btn">-</button>
                                </div>
                            ))}
                            <button onClick={addIngredient} className="add-ingredient-btn">+ Добавить ингредиент</button>
                            <input type='text' placeholder='Время приготовления (напр. 2-3 дня)' value={product.preparationTime} onChange={e => setProduct({ ...product, preparationTime: e.target.value })} />
                        </div>
                    )}

                    <div className="form-navigation">
                        {step > 1 && <button onClick={prevStep}>Назад</button>}
                        {step < 3 && <button onClick={nextStep}>Далее</button>}
                    </div>

                    {isDirty && <button onClick={updateProduct} className="save-btn">Сохранить</button>}
                    <button onClick={() => navigate('/profile')} className="cancel-btn">Отмена</button>
                </div>
            </div>
        </main>
    );
};

export default EditProduct;
