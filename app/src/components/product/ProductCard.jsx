import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../utils/formatCurrency';
import { useFavourites } from '../../context/FavouritesContext';
import { getImageUrl } from '../../utils/getImageUrl';

export function ProductCard({
  id,
  slug,
  name,
  club,
  category,
  price,
  originalPrice,
  image,
  badge,
  sizes: _sizes = ["M"],
  colors = []
}) {
  const navigate = useNavigate();
  const { toggleFavourite, isFavourite } = useFavourites();
  const favourite = isFavourite(id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite({ id, name, club, category, price, originalPrice, image, badge });
  };

  const handleCardClick = () => {
    navigate(`/products/${slug || id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="jersey-card group relative bg-surface-container-lowest overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col h-full rounded-xl border border-outline-variant/30"
    >
      {/* Product Image Area */}
      <div className="aspect-[3/4] bg-surface-variant relative overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          src={getImageUrl(image)}
          alt={name}
          loading="lazy"
        />

        {/* Badge overlay */}
        {badge ? (
          <div className="absolute top-sm left-sm z-10">
            <Badge variant={badge}>{badge === 'sale' ? 'Sale' : badge === 'new' ? 'New Arrival' : badge}</Badge>
          </div>
        ) : null}

        {/* Favorite Icon Overlay */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-sm right-sm z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center transition-all shadow-sm ${
            favourite ? 'text-secondary opacity-100 scale-105' : 'text-primary opacity-0 group-hover:opacity-100 hover:text-secondary'
          }`}
          aria-label="Add to favourites"
        >
          <Icon
            name="favorite"
            className={favourite ? 'text-[22px]' : 'text-[22px]'}
            style={favourite ? { fontVariationSettings: '"FILL" 1' } : undefined}
          />
        </button>
      </div>

      {/* Product Info Area */}
      <div className="p-md flex flex-col flex-1 justify-between space-y-xs">
        <div className="space-y-1">
          {club ? (
            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">{club}</p>
          ) : (
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{category}</p>
          )}
          <h3 className="text-body-md font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2 leading-snug">
            {name}
          </h3>
        </div>

        <div className="flex justify-between items-center pt-sm border-t border-outline-variant/30 mt-sm">
          <div className="flex items-center gap-xs">
            <span className="text-body-md font-bold text-primary">{formatCurrency(price)}</span>
            {originalPrice ? (
              <span className="text-label-sm line-through text-on-surface-variant">
                {formatCurrency(originalPrice)}
              </span>
            ) : null}
          </div>

          {/* Color swatch indicator */}
          {colors && colors.length > 0 ? (
            <div className="flex gap-1">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-outline-variant"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
