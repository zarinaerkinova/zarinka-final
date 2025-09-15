import React, { useEffect, useState, useRef } from 'react';
import './CategoryMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { GiCakeSlice, GiCupcake, GiBread, GiDonut } from 'react-icons/gi';
import { useProductStore } from '../store/Product';
import useOutsideAlerter from '../hooks/useOutsideAlerter';

const CategoryMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsOpen(false));

  const { categories, fetchCategories } = useProductStore();

  useEffect(() => {
    // Check if categories is empty or not an array
    if (!categories || categories.length === 0 || !Array.isArray(categories)) {
      fetchCategories();
    }
  }, [fetchCategories]); // Only depend on fetchCategories

  // Optional: assign bakery icons by category name
  const categoryIcons = {
    Cakes: <GiCakeSlice />,
    Cupcakes: <GiCupcake />,
    Bread: <GiBread />,
    Donuts: <GiDonut />,
  };

  return (
    <div ref={wrapperRef}>
      <button className="burger-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
        Каталог
      </button>

      <div className={`category-menu-wrapper ${isOpen ? 'open' : ''}`}>
        <div className="category-sidebar">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat, index) => (
              <div
                key={cat._id || index}
                className={`category-item ${activeCategory === index ? 'active' : ''}`}
                onClick={() => setActiveCategory(index)}
              >
                <span className="category-icon">
                  {categoryIcons[cat.name] || <GiCakeSlice />}
                </span>
                {cat.name}
              </div>
            ))
          ) : (
            <div className="loading-categories">Loading categories...</div>
          )}
        </div>

        <div className="category-submenu">
          {activeCategory !== null && categories[activeCategory] && (
            <div className="subcategory-group">
              <h4>{categories[activeCategory].name}</h4>
              <p>Здесь можно отобразить подкатегории или товары...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;