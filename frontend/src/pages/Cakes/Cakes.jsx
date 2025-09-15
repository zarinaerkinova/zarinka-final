import React, { useEffect, useState, useCallback } from 'react'
import './Cakes.css'
import Card from '../../components/Card.jsx'
import { Link } from 'react-router-dom'
import { useProductStore } from '../../store/Product.js'

const Cakes = () => {
    const { fetchProducts, fetchCategories, products, categories } = useProductStore()
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [selectedIngredients, setSelectedIngredients] = useState([])
    const [minRate, setMinRate] = useState('')

    const availableIngredients = ['Chocolate', 'Vanilla', 'Strawberry', 'Cream', 'Fruits', 'Nuts', 'Caramel']

    const applyFilters = useCallback(() => {
        const filters = {
            search: searchTerm,
            minPrice: minPrice,
            maxPrice: maxPrice,
            ingredients: selectedIngredients,
            minRating: minRate,
            category: selectedCategory?._id,
        }
        fetchProducts(filters)
    }, [searchTerm, minPrice, maxPrice, selectedIngredients, minRate, selectedCategory, fetchProducts])

    useEffect(() => {
        fetchCategories()
        applyFilters() // Initial fetch on mount
    }, []) // Empty dependency array to run only once on mount

    const handleCategoryClick = (category) => {
        setSelectedCategory(category)
        applyFilters() // Apply filters immediately on category change
    }

    const handleAllProducts = () => {
        setSelectedCategory(null)
        applyFilters() // Apply filters immediately for all products
    }

    const handleIngredientChange = (ingredient) => {
        setSelectedIngredients(prev =>
            prev.includes(ingredient)
                ? prev.filter(item => item !== ingredient)
                : [...prev, ingredient]
        )
    }

    return (
        <main>
            <div className="menu">
                <h2>Фильтры</h2>
                <div className="filter-section">
                    <h3>Поиск</h3>
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-section">
                    <h3>Цена</h3>
                    <div className="price-filter">
                        <input
                            type="number"
                            placeholder="От"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="До"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Ингредиенты</h3>
                    <div className="ingredients-filter">
                        {availableIngredients.map(ingredient => (
                            <label key={ingredient}>
                                <input
                                    type="checkbox"
                                    value={ingredient}
                                    checked={selectedIngredients.includes(ingredient)}
                                    onChange={() => handleIngredientChange(ingredient)}
                                />
                                <span className="checkmark"></span>
                                {ingredient}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Рейтинг (от)</h3>
                    <select value={minRate} onChange={(e) => setMinRate(e.target.value)}>
                        <option value="">Все</option>
                        <option value="1">1 звезда и выше</option>
                        <option value="2">2 звезды и выше</option>
                        <option value="3">3 звезды и выше</option>
                        <option value="4">4 звезды и выше</option>
                        <option value="5">5 звезд</option>
                    </select>
                </div>

                <div className="filter-section">
                    <h3>Категории</h3>
                    <form className="menu_form">
                        <Link to={"#"} onClick={() => { handleAllProducts(); applyFilters(); }} className={!selectedCategory ? 'active' : ''}>
                            Все продукты
                        </Link>
                        {categories && categories.length > 0 ? (
                            categories.map((category) => (
                                <Link
                                    key={category._id}
                                    to={"#"}
                                    onClick={() => { handleCategoryClick(category); applyFilters(); }}
                                    className={selectedCategory?._id === category?._id ? 'active' : ''}
                                >
                                    {category.name}
                                </Link>
                            ))
                        ) : (
                            <p>Загрузка категорий...</p>
                        )}
                    </form>
                </div>
                <button className="apply-filters-btn" onClick={applyFilters}>Применить фильтры</button>
            </div>
            <div className="catalogue">
                <h2>Cakes</h2>
                <div className="catalogue_content">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <Card key={product._id} product={product} />
                        ))
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </main>
    )
}

export default Cakes
