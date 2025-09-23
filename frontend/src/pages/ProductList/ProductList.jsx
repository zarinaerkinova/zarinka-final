import React, { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../config/axios.js'
import { useUserStore } from '../../store/User.js'
import { useLoadingStore } from '../../store/Loading'
import OnlyAdmins from '../../components/OnlyAdmins.jsx'
import DashboardProductCard from '../../components/DashboardProductCard/DashboardProductCard.jsx';
import './ProductList.scss'
import DashboardOrderCard from '../../components/DashboardOrderCard/DashboardOrderCard'
import { useOrderStore } from '../../store/Order'
import { useProductStore } from '../../store/Product'

const ProductList = () => {
    const { setLoading: setLoadingGlobal } = useLoadingStore();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [bakerId, setBakerId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bakerInfo, setBakerInfo] = useState(null);
    const { userInfo, fetchProfile, logoutUser, token } = useUserStore()
	const { newOrders, completedOrders, allBakerOrders, fetchBakerOrders } =
		useOrderStore()
	const { bakerProducts, fetchProductsByBaker } = useProductStore()
	const navigate = useNavigate()

    useEffect(() => {
		if (!token) {
			navigate('/register')
		} else {
			fetchProfile()
			fetchBakerOrders(token)
			if (userInfo?._id) {
				fetchProductsByBaker(userInfo._id)
			}
		}
	}, [
		token,
		fetchProfile,
		fetchBakerOrders,
		navigate,
		userInfo?._id,
		fetchProductsByBaker,
	])

    const handleLogout = () => {
		logoutUser()
		navigate('/register')
	}

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const baker = params.get('bakerId');
        setBakerId(baker);

        const fetchProducts = async () => {
            setLoadingGlobal(true);
            setError(null);
            try {
                let url = '/products';
                if (baker) {
                    url = `/products?bakerId=${baker}`;
                }

                const response = await api.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProducts(response.data.data);

                // Если есть bakerId, получаем информацию о кондитерe
                if (baker) {
                    await fetchBakerInfo(baker);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.response?.data?.message || 'Failed to fetch products');
                toast.error(err.response?.data?.message || 'Failed to fetch products');
            } finally {
                setLoadingGlobal(false);
            }
        };

        const fetchBakerInfo = async (bakerId) => {
            try {
                const response = await api.get(`/users/${bakerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBakerInfo(response.data.data);
            } catch (err) {
                console.error('Error fetching baker info:', err);
                toast.error('Failed to fetch baker information');
            }
        };

        if (token) {
            fetchProducts();
        }
    }, [location.search, token, setLoadingGlobal, bakerId]);

    const getTitle = () => {
        if (bakerId && bakerInfo) {
            return `Торты кондитера: ${bakerInfo.name}`;
        } else if (bakerId) {
            return 'Торты кондитера';
        }
        return 'Все продукты';
    };

    useEffect(() => {
		if (!token) {
			navigate('/register')
		} else {
			fetchProfile()
			fetchBakerOrders(token)
			if (userInfo?._id) {
				fetchProductsByBaker(userInfo._id)
			}
		}
	}, [
		token,
		fetchProfile,
		fetchBakerOrders,
		navigate,
		userInfo?._id,
		fetchProductsByBaker,
	])

    const filteredProducts = bakerProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <OnlyAdmins>
            <div className='product-list-page'>
                <h1>{getTitle()}</h1>

                <div className='search-bar'>
                    <input
                        type='text'
                        placeholder='Поиск по названию торта...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Информация о кондитерe */}
                {bakerInfo && (
                    <div className='baker-info-card'>
                        <div className='baker-profile'>
                            {bakerInfo.image ? (
                                <img
                                    src={`https://api.zarinka.uz${bakerInfo.image}`}
                                    alt={bakerInfo.name}
                                    className='baker-avatar'
                                />
                            ) : (
                                <div className='baker-avatar-initials'>
                                    {bakerInfo.name?.charAt(0) || 'B'}
                                </div>
                            )}
                            <div className='baker-details'>
                                <h3>{bakerInfo.name}</h3>
                                {bakerInfo.bakeryName && (
                                    <p className='bakery-name'>{bakerInfo.bakeryName}</p>
                                )}
                                <div className='baker-rating'>
                                    <span className='rating-stars'>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span 
                                                key={i} 
                                                className={`star ${i < Math.floor(bakerInfo.rating || 0) ? 'filled' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </span>
                                    <span className='rating-value'>
                                        {bakerInfo.rating?.toFixed(1) || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className='error-message'>{error}</p>}

                {products.length === 0 && !error && (
                    <p>Торты не найдены.</p>
                )}

                <div className='product-grid'>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <DashboardProductCard key={product._id} product={product} />
                        ))
                    ) : (
                        <div className='empty-state'>
                            <div className='empty-icon'>🧁</div>
                            <p>Торты не найдены.</p>
                            <Link to='/addproduct' className='btn btn-primary btn-sm'>
                                Добавить свой первый торт
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </OnlyAdmins>
    );
};

export default ProductList;