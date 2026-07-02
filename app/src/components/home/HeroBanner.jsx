import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import heroBgImage from '../../assets/images.jpeg';

export function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] flex items-center overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBgImage})`,
          }}
          aria-label="Stadium Tunnel background"
        />
        {/* Sleek Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface/85 via-on-surface/40 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="text-label-md font-label-md bg-secondary text-on-secondary px-3 py-1 rounded-full mb-base inline-block uppercase tracking-widest">
            Season 24/25 Now Live
          </span>
          <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white mb-md leading-tight tracking-tight">
            World Cup '26 Kits
          </h2>
          <div className="flex flex-wrap gap-md">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/products')}
              className="px-8 py-3"
            >
              Shop New Kits
            </Button>
            <Button
              variant="outlineWhite"
              size="lg"
              onClick={() => navigate('/products?category=premier-league')}
              className="px-8 py-3"
            >
              View Collections
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
