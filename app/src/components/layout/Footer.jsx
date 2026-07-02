import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant w-full mt-auto">
      {/* Upper Footer: 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md px-margin-mobile md:px-margin-desktop py-lg max-w-7xl mx-auto">
        {/* Column 1: Brand */}
        <div className="space-y-md">
          <Link to="/" className="text-headline-sm font-headline-sm font-bold tracking-tighter text-on-surface hover:text-secondary transition-colors">
            THE FUEL STORE
          </Link>
          <p className="text-on-surface-variant text-body-md leading-relaxed">
            The ultimate destination for premium football performance and lifestyle apparel. Engineered for the fans, by the fans.
          </p>
          <div className="flex gap-md">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:text-secondary hover:bg-secondary-container transition-all"
              aria-label="Facebook"
            >
              <Icon name="public" className="text-[20px]" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:text-secondary hover:bg-secondary-container transition-all"
              aria-label="Instagram"
            >
              <Icon name="share" className="text-[20px]" />
            </a>
            <a
              href="mailto:support@thefuelstore.com"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:text-secondary hover:bg-secondary-container transition-all"
              aria-label="Email"
            >
              <Icon name="mail" className="text-[20px]" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold text-on-surface mb-md text-label-md uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-sm text-on-surface-variant">
            <li>
              <Link to="/products?filter=new" className="text-body-md hover:text-secondary transition-colors">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-body-md hover:text-secondary transition-colors">
                Best Sellers
              </Link>
            </li>
            <li>
              <Link to="/products?category=premier-league" className="text-body-md hover:text-secondary transition-colors">
                Clubs & Leagues
              </Link>
            </li>
            <li>
              <Link to="/products?filter=sale" className="text-body-md hover:text-secondary transition-colors">
                Clearance Sale
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <h4 className="font-bold text-on-surface mb-md text-label-md uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-sm text-on-surface-variant">
            <li>
              <a href="#shipping" className="text-body-md hover:text-secondary transition-colors">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#returns" className="text-body-md hover:text-secondary transition-colors">
                Returns & Exchanges
              </a>
            </li>
            <li>
              <a href="#track" className="text-body-md hover:text-secondary transition-colors">
                Track My Order
              </a>
            </li>
            <li>
              <a href="#sizing" className="text-body-md hover:text-secondary transition-colors">
                Sizing Guide
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div>
          <h4 className="font-bold text-on-surface mb-md text-label-md uppercase tracking-wider">Company</h4>
          <ul className="space-y-sm text-on-surface-variant">
            <li>
              <a href="#about" className="text-body-md hover:text-secondary transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#terms" className="text-body-md hover:text-secondary transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#privacy" className="text-body-md hover:text-secondary transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#contact" className="text-body-md hover:text-secondary transition-colors">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Lower Footer: Copyright & Payments */}
      <div className="border-t border-outline-variant py-md px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-base">
        <p className="text-label-sm text-on-surface-variant">
          © {new Date().getFullYear()} THE FUEL STORE Performance. All Rights Reserved.
        </p>
        <div className="flex gap-md">
          <div className="w-12 h-8 bg-surface-container rounded-sm flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <Icon name="credit_card" className="text-[20px] text-on-surface-variant" />
          </div>
          <div className="w-12 h-8 bg-surface-container rounded-sm flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <Icon name="payments" className="text-[20px] text-on-surface-variant" />
          </div>
          <div className="w-12 h-8 bg-surface-container rounded-sm flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <Icon name="account_balance_wallet" className="text-[20px] text-on-surface-variant" />
          </div>
        </div>
      </div>
    </footer>
  );
}
