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
            return ''; // Fallback for undefined/null/malformed ingredients
        });
    } else if (typeof ingredients === 'object') {
        // For custom cakes, ingredients is an object like { sponge: 'Vanilla', cream: 'Buttercream', decor: 'Sprinkles' }
        // We want to display the values
        ingredientsToDisplay = Object.values(ingredients).map(val => {
            if (typeof val === 'string') {
                return val;
            } else if (val && typeof val === 'object' && val.name) {
                return val.name;
            }
            return ''; // Fallback for undefined/null/malformed values
        });
    }

    if (ingredientsToDisplay.length === 0) {
        return null;
    }

    return (
        <div className="ingredients-tooltip">
            <h4>Ingredients:</h4>
            <ul>
                {ingredientsToDisplay.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
        </div>
    );
};

export default IngredientsTooltip;
