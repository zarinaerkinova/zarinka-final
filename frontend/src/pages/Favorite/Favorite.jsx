// Refreshing the file to fix a potential caching issue.
import React, { useEffect, useCallback, useMemo } from 'react';
import { useUserStore } from '../../store/User.js';
import toast from 'react-hot-toast';
import FavoriteCard from '../../components/FavoriteCard/FavoriteCard.jsx';
import FavoriteBakerCard from '../../components/FavoriteBakerCard/FavoriteBakerCard.jsx';
import './Favorite.scss';
import { RiHeartLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

export default function Favorite() {
  const {
    favorites, 
    fetchFavorites,
    bakerFavorites, 
    fetchBakerFavorites,
    hydrated, 
    token
  } = useUserStore();

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (hydrated && token) {
      try {
        await Promise.all([
          fetchFavorites(),
          fetchBakerFavorites()
        ]);
      } catch (err) {
        toast.error(err.message || 'Failed to load favorites');
      }
    }
  }, [fetchFavorites, fetchBakerFavorites, hydrated, token]);

  // Fetch both product and baker favorites
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized derived values for better performance
  const areFavoritesEmpty = useMemo(() => 
    favorites?.length === 0 && bakerFavorites?.length === 0,
    [favorites, bakerFavorites]
  );

  const hasProductFavorites = useMemo(() => 
    favorites?.length > 0, 
    [favorites]
  );

  const hasBakerFavorites = useMemo(() => 
    bakerFavorites?.length > 0, 
    [bakerFavorites]
  );

  if (!token) {
    return (
      <div className="favorite-container p-6">
        <h1 className="text-2xl font-bold mb-4">⭐ My Favorites</h1>
        <p className="text-red-500">Please log in to view your favorites.</p>
      </div>
    );
  }

  return (
    <div className="favorite-container p-6">
      {areFavoritesEmpty ? (
        <EmptyFavoritesState />
      ) : (
        <>
          {/* Product Favorites */}
          {hasProductFavorites && (
            <FavoriteSection 
              title="Products" 
              items={favorites} 
              renderItem={(product) => (
                <FavoriteCard key={product._id} product={product} />
              )}
            />
          )}

          {/* Baker Favorites */}
          {hasBakerFavorites && (
            <FavoriteSection 
              title="Bakers" 
              items={bakerFavorites} 
              renderItem={(baker) => (
                <FavoriteBakerCard key={baker._id} baker={baker} />
              )}
            />
          )}
        </>
      )}
    </div>
  );
}

// Sub-components for better organization
function EmptyFavoritesState() {
  return (
    <div className="empty-favorites">
      <RiHeartLine className="heart_icon" />
      <h3>You have no favorites yet</h3>
      <p>Browse our cakes and bakers to find something you like</p>
      <div className="btns">
        <Link to={'/cakes'} className="build">Browse Products</Link>
        <Link to={'/bakers'} className="browse">Browse Bakers</Link>
      </div>
    </div>
  );
}

function FavoriteSection({ title, items, renderItem }) {
  return (
    <div className="favorite-section">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="favorite-container__grid">
        {items.map(renderItem)}
      </div>
    </div>
  );
}