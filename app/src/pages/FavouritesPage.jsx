import React from 'react';
import { Link } from 'react-router-dom';
import { useFavourites } from '../context/FavouritesContext';
import { Icon } from '../components/ui/Icon';
import { formatCurrency } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/getImageUrl';

export function FavouritesPage() {
  const { favourites, toggleFavourite } = useFavourites();

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md min-h-screen">
      {/* Page Header */}
      <section className="mb-lg">
        <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary tracking-tight uppercase">
          Favourites
        </h2>
        <p className="text-body-md text-on-surface-variant mt-xs">
          {favourites.length > 0
            ? `${favourites.length} item${favourites.length > 1 ? 's' : ''} saved`
            : 'Your saved items will appear here'}
        </p>
      </section>

      {favourites.length === 0 ? (
        <div className="text-center py-24 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/60 animate-fade-in-up">
          <Icon name="favorite_border" className="text-5xl text-on-surface-variant mb-md" />
          <h4 className="text-headline-sm font-headline-sm mb-xs">No Favourite Items</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter animate-fade-in-up">
          {favourites.map((product) => (
            <div
              key={product.id}
              className="group relative bg-surface-container-lowest overflow-hidden rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <Link to={`/products/${product.slug || product.id}`} className="block aspect-[3/4] bg-surface-variant relative overflow-hidden">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </Link>

              {/* Remove favourite button */}
              <button
                onClick={() => toggleFavourite(product)}
                className="absolute top-sm right-sm z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-secondary shadow-sm hover:scale-110 active:scale-95 transition-all"
                aria-label="Remove from favourites"
              >
                <Icon
                  name="favorite"
                  className="text-[22px]"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                />
              </button>

              {/* Info */}
              <div className="p-md flex flex-col gap-xs flex-1 justify-between">
                <div>
                  {product.club && (
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1">
                      {product.club}
                    </p>
                  )}
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    className="text-body-md font-bold text-primary hover:text-secondary transition-colors line-clamp-2 leading-snug"
                  >
                    {product.name}
                  </Link>
                </div>
                <div className="flex items-center gap-xs pt-sm border-t border-outline-variant/30">
                  <span className="text-body-md font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice ? (
                    <span className="text-label-sm line-through text-on-surface-variant">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
