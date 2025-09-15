import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../config/axios.js'
import { useUserStore } from '../../store/User.js'
import OnlyAdmins from '../../components/OnlyAdmins.jsx'
import Card from '../../components/Card.jsx';
// import './ProductList.scss'

const ProductList = () => {
    const { token } = useUserStore();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all', 'total', 'available'

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filter = params.get('filter');
        setFilterType(filter || 'all');

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = '/products';
                if (filter === 'available') {
                    url = '/products?isAvailable=true';
                } else if (filter === 'total') {
                    // No specific filter needed for total, getProducts without isAvailable param
                    url = '/products';
                }

                const response = await api.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProducts(response.data.data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.response?.data?.message || 'Failed to fetch products');
                toast.error(err.response?.data?.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProducts();
        }
    }, [location.search, token]);

    const getTitle = () => {
        switch (filterType) {
            case 'total':
                return 'All Products';
            case 'available':
                return 'Available Products';
            default:
                return 'Product List';
        }
    };

    return (
        <OnlyAdmins>
            <div className='product-list-page'>
                <h1>{getTitle()}</h1>

                {loading && <p>Loading products...</p>}
                {error && <p className='error-message'>{error}</p>}

                {!loading && !error && products.length === 0 && (
                    <p>No products found.</p>
                )}

                <div className='product-grid'>
                    {!loading && !error && products.map(product => (
                        <Card key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </OnlyAdmins>
    );
};

export default ProductList;
