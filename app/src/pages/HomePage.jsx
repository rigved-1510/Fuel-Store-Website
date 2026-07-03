import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategorySection } from '../components/home/CategorySection';
import { AboutUs } from '../components/home/AboutUs';
import { ProductCard } from '../components/product/ProductCard';
import { getProducts } from '../services/productService';
import { Button } from '../components/ui/Button';

export function HomePage() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    // Fetch products
    getProducts()
      .then((data) => {
        // Take first 4 jerseys for the homepage featured section
        const jerseysOnly = data.filter(p => p.category !== 'accessories');
        setPopularProducts(jerseysOnly.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-0">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Category Circles Section */}
      <CategorySection />

      {/* 3. Popular/Featured Kits Section */}
      <section className="py-xl bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-xl">
            <div>
              <h3 className="text-headline-md font-headline-md text-primary mb-xs">
                Popular Kits
              </h3>
              <p className="text-on-surface-variant">
                The most wanted jerseys of the season, selected by the community.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/products')}
              className="mt-sm sm:mt-0"
            >
              Shop All Jerseys
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse bg-surface-container rounded-xl aspect-[3/4] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. About Us Section */}
      <AboutUs />
    </div>
  );
}
