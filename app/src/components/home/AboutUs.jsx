import React from 'react';
import storeImg from '../../assets/store.png';
import { Icon } from '../ui/Icon';

export function AboutUs() {
  return (
    <section className="py-xl bg-surface-container-low border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-md animate-fade-in-up">
            <div>
              <h3 className="text-headline-md font-headline-md text-primary mb-xs">
                About Us
              </h3>
              <div className="h-1 w-16 bg-secondary rounded-full mb-base"></div>
            </div>
            
            <div className="space-y-base text-on-surface-variant font-body-md leading-relaxed">
              <p>
                <strong className="text-on-surface font-semibold">Fuel: The Fashion Hub</strong> – your trusted destination for the latest trends in fashion and lifestyle. Based in the heart of Kolhapur, we are dedicated to offering a carefully curated collection of stylish clothing and accessories that combine quality, comfort, and affordability.
              </p>
              <p>
                With a commitment to excellent customer service and a passion for fashion, we strive to help every customer find the perfect look for every occasion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-base">
              {/* Visit Us */}
              <div className="flex gap-sm p-base bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-secondary mt-1 flex-shrink-0">
                  <Icon name="location_on" className="text-[24px]" />
                </div>
                <div>
                  <h5 className="text-label-md font-bold uppercase tracking-wider text-primary mb-xs">
                    Visit Us
                  </h5>
                  <p className="text-label-sm text-on-surface-variant leading-relaxed">
                    2685 'B' Ward, Near Patakadil Talim Mandal (PTM), Mangalwar Peth, Kolhapur, Maharashtra – 416012
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-sm p-base bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-secondary mt-1 flex-shrink-0">
                  <Icon name="call" className="text-[24px]" />
                </div>
                <div>
                  <h5 className="text-label-md font-bold uppercase tracking-wider text-primary mb-xs">
                    Contact
                  </h5>
                  <p className="text-label-sm text-on-surface-variant leading-relaxed">
                    <a href="tel:+919822672277" className="hover:text-secondary transition-colors duration-200">
                      +91 98226 72277
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image — appears above text on mobile, right column on desktop */}
          <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 order-first lg:order-last">
            <img
              src={storeImg}
              alt="Fuel Store Front"
              className="w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
