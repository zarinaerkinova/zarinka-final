import React, { useEffect, useState } from 'react';
import '../Cakes/Cakes.css'; // Reusing styles from Cakes page for layout
import './BakersPage.css';
import '../../components/Card.scss'; // Using cake card styles
import BakerCard from '../../components/BakerCard.jsx';
import { useBakerStore } from '../../store/Baker.js';

const BakersPage = () => {
    const { bakers, fetchBakers } = useBakerStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [availability, setAvailability] = useState('');
    const [rating, setRating] = useState('');
    const [filteredBakers, setFilteredBakers] = useState([]);

    useEffect(() => {
        fetchBakers();
    }, [fetchBakers]);

    useEffect(() => {
        setFilteredBakers(bakers);
    }, [bakers]);

    const handleFilter = () => {
        let tempBakers = [...bakers];

        if (searchTerm) {
            tempBakers = tempBakers.filter(baker =>
                (baker.name && baker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (baker.bakery && baker.bakery.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (location) {
            tempBakers = tempBakers.filter(baker => baker.city === location);
        }

        if (availability) {
            tempBakers = tempBakers.filter(baker => 
                availability === 'available' ? baker.isAvailable : !baker.isAvailable
            );
        }

        if (rating) {
            tempBakers = tempBakers.filter(baker => baker.rate >= parseInt(rating));
        }

        setFilteredBakers(tempBakers);
    };

    return (
        <main>
            <div className="menu">
                <h2>Filters</h2>
                <div className="filter-section">
                    <h3>Search</h3>
                    <input
                        type="text"
                        placeholder="Search by name or bakery..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-section">
                    <h3>Location</h3>
                    <select value={location} onChange={(e) => setLocation(e.target.value)}>
                        <option value="">All Locations</option>
                        {/* Should be populated from baker data */}
                    </select>
                </div>
                <div className="filter-section">
                    <h3>Availability</h3>
                    <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                        <option value="">All</option>
                        <option value="available">Available Now</option>
                        <option value="not-available">Unavailable</option>
                    </select>
                </div>
                <div className="filter-section">
                    <h3>Rating</h3>
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value="">All Ratings</option>
                        <option value="4">4 stars and up</option>
                        <option value="3">3 stars and up</option>
                        <option value="2">2 stars and up</option>
                        <option value="1">1 star and up</option>
                    </select>
                </div>
                <button className="apply-filters-btn" onClick={handleFilter}>Apply Filters</button>
            </div>
            <div className="catalogue">
                <h2>Find Bakers</h2>
                <div className="bakers-page_content">
                    {filteredBakers.map(baker => (
                        <BakerCard key={baker._id} baker={baker} />
                    ))}
                </div>
            </div>
        </main>
    );};

export default BakersPage;