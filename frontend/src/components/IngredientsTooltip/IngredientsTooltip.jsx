import React from 'react';
import './IngredientsTooltip.scss';

const IngredientsTooltip = ({ ingredients }) => {
    if (!ingredients) {
        return null;
    }

    let ingredientsToDisplay = [];

    if (Array.isArray(ingredients)) {
        ingredientsToDisplay = ingredients.map(ing => {
            if (typeof ing === 'string') {
                return ing;
            } else if (ing && typeof ing === 'object' && ing.name) {
                return ing.name;
            }
            return '';
        }).filter(Boolean);
    } else if (typeof ingredients === 'object') {
        ingredientsToDisplay = Object.values(ingredients).map(val => {
            if (typeof val === 'string') {
                return val;
            } else if (val && typeof val === 'object' && val.name) {
                return val.name;
            }
            return '';
        }).filter(Boolean);
    }

    if (ingredientsToDisplay.length === 0) {
        return null;
    }

    return (
        <div className="ingredients-list">
            <strong>Ingredients:</strong>
            <ul>
                {ingredientsToDisplay.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
        </div>
    );
};

export default IngredientsTooltip;