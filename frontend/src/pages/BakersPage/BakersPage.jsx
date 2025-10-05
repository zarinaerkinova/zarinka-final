import React, { useEffect, useState } from 'react';
import './BakersPage.css';
import BakerCard from '../../components/BakerCard.jsx';
import { useBakerStore } from '../../store/Baker.js';
import { useLoadingStore } from '../../store/Loading'; // Import useLoadingStore

import { useTranslation } from 'react-i18next';

const BakersPage = () => {
    const { t } = useTranslation();
    const { bakers, fetchBakers } = useBakerStore();
    const { setLoading } = useLoadingStore(); // Get setLoading from global store
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [availability, setAvailability] = useState('all');
    const [rating, setRating] = useState('0');
    const [filteredBakers, setFilteredBakers] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [bakersPerPage] = useState(9); // Display 9 bakers per page

    // Debounced state variables
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [debouncedLocation, setDebouncedLocation] = useState('');
    const [debouncedAvailability, setDebouncedAvailability] = useState('all');
    const [debouncedRating, setDebouncedRating] = useState('0');

    // Effect for debouncing search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms debounce delay
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Effect for debouncing location
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedLocation(location);
        }, 500); // 500ms debounce delay
        return () => {
            clearTimeout(timerId);
        };
    }, [location]);

    // Effect for debouncing availability
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedAvailability(availability);
        }, 500); // 500ms debounce delay
        return () => {
            clearTimeout(timerId);
        };
    }, [availability]);

    // Effect for debouncing rating
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedRating(rating);
        }, 500); // 500ms debounce delay
        return () => {
            clearTimeout(timerId);
        };
    }, [rating]);

    useEffect(() => {
        const loadBakers = async () => {
            setLoading(true); // Set global loading to true
            try {
                await fetchBakers();
            } catch (error) {
                console.error("Failed to fetch bakers:", error);
            } finally {
                setLoading(false); // Set global loading to false
            }
        };
        loadBakers();
    }, [fetchBakers, setLoading]);

    useEffect(() => {
        let tempBakers = [...bakers];

        if (debouncedSearchTerm) {
            tempBakers = tempBakers.filter(baker =>
                (baker.name && baker.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
                (baker.bakery && baker.bakery.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            );
        }

        if (debouncedLocation) {
            tempBakers = tempBakers.filter(baker => baker.city === debouncedLocation);
        }

        if (debouncedAvailability !== 'all') {
            tempBakers = tempBakers.filter(baker => 
                debouncedAvailability === 'available' ? baker.isAvailable : !baker.isAvailable
            );
        } else if (debouncedAvailability === 'all') {
            // If 'all' is selected, don't filter by availability
        }

        if (debouncedRating !== '0') {
            tempBakers = tempBakers.filter(baker => baker.rate >= parseInt(debouncedRating));
        }

        setFilteredBakers(tempBakers);
        setCurrentPage(1); // Reset to first page on filter change
    }, [bakers, debouncedSearchTerm, debouncedLocation, debouncedAvailability, debouncedRating]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };

    const handleAvailabilityChange = (e) => {
        setAvailability(e.target.value);
    };

    const handleRatingChange = (e) => {
        setRating(e.target.value);
    };

    // Get current bakers for display
    const indexOfLastBaker = currentPage * bakersPerPage;
    const indexOfFirstBaker = 0; // Always start from the beginning for 'Load More'
    const currentBakers = filteredBakers.slice(indexOfFirstBaker, indexOfLastBaker);

    const loadMoreBakers = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const hasMoreBakers = indexOfLastBaker < filteredBakers.length;

    return (
        <main>
            <div className="menu">
                <h2>{t('bakers_page_filters')}</h2>
                <div className="filter-section">
                    <h3>{t('bakers_page_search')}</h3>
                    <input
                        type="text"
                        placeholder={t('bakers_page_search_placeholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                <div className="filter-section">
                    <h3>{t('bakers_page_location')}</h3>
                    <select value={location} onChange={handleLocationChange} className="filter-select">
                        <option value="">{t('bakers_page_all_locations')}</option>
                        <option value="Tashkent">{t('bakers_page_tashkent')}</option>
                        <option value="Samarkand">{t('bakers_page_samarkand')}</option>
                        <option value="Bukhara">{t('bakers_page_bukhara')}</option>
                        <option value="Fergana">{t('bakers_page_fergana')}</option>
                    </select>
                </div>

                <div className="filter-section">
                    <h3>{t('bakers_page_availability')}</h3>
                    <select value={availability} onChange={handleAvailabilityChange} className="filter-select">
                        <option value="all">{t('bakers_page_all_availability')}</option>
                        <option value="available">{t('bakers_page_available')}</option>
                        <option value="unavailable">{t('bakers_page_unavailable')}</option>
                    </select>
                </div>

                <div className="filter-section">
                    <h3>{t('bakers_page_rating')}</h3>
                    <select value={rating} onChange={handleRatingChange} className="filter-select">
                        <option value="0">{t('bakers_page_all_ratings')}</option>
                        <option value="5">{t('bakers_page_5_stars')}</option>
                        <option value="4">{t('bakers_page_4_stars')}</option>
                        <option value="3">{t('bakers_page_3_stars')}</option>
                        <option value="2">{t('bakers_page_2_stars')}</option>
                    </select>
                </div>
            </div>
            <div className="catalogue">
                <h2>{t('bakers_page_find_bakers')}</h2>
                <div className="catalogue_content">
                    {currentBakers.length > 0 ? (
                        currentBakers.map(baker => (
                            <BakerCard key={baker._id} baker={baker} />
                        ))
                    ) : (
                        <p className="no-bakers-message">{t('bakers_page_no_bakers')}</p>
                    )}
                </div>
                {hasMoreBakers && (
                    <button onClick={loadMoreBakers} className="load-more-button">{t('bakers_page_load_more')}</button>
                )}
            </div>
        </main>
    );
};

export default BakersPage;