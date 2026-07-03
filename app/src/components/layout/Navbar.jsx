import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavourites } from '../../context/FavouritesContext';
import { Icon } from '../ui/Icon';

export function Navbar() {
  const { totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { favourites } = useFavourites();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Clothing', to: '/products?category=clothing' },
    { label: 'Jerseys', to: '/products' },
    { label: 'Sale', to: '/products?filter=sale' },
  ];

  const isLinkActive = (linkTo) => {
    const [path, search] = linkTo.split('?');
    const searchString = search ? `?${search}` : '';
    
    if (linkTo === '/products') {
      return (
        location.pathname === '/products' &&
        !location.search.includes('filter=sale') &&
        !location.search.includes('category=clothing')
      );
    }
    
    return location.pathname === path && location.search === searchString;
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  const headerClass = isTransparent
    ? 'bg-transparent'
    : 'bg-surface shadow-sm border-b border-outline-variant/10';

  const textClass = isTransparent
    ? 'text-white'
    : 'text-on-surface';

  const textVariantClass = isTransparent
    ? 'text-white/80 hover:text-white'
    : 'text-on-surface-variant hover:text-secondary';

  const logoClass = isTransparent
    ? 'text-white hover:text-white/80'
    : 'text-on-surface hover:text-secondary';

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerClass}`}
      >
        <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-7xl mx-auto">
          {/* Logo & Hamburger */}
          <div className="flex items-center gap-base">
            <button
              onClick={() => setIsOpen(true)}
              className={`p-2 active:opacity-80 active:scale-95 transition-all md:hidden focus:outline-none ${textClass}`}
              aria-label="Open menu"
            >
              <Icon name="menu" className="text-[24px]" />
            </button>
            <Link
              to="/"
              className={`text-headline-sm font-headline-sm font-bold tracking-tighter transition-colors ${logoClass}`}
            >
              THE FUEL STORE
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-lg">
            {navLinks.map((link) => {
              const active = isLinkActive(link.to);
              return (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={`text-label-md font-label-md font-bold transition-colors duration-200 ${
                    active
                      ? isTransparent
                        ? 'text-white font-bold underline decoration-2 underline-offset-4'
                        : 'text-secondary font-bold'
                      : textVariantClass
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-md">
            <Link
              to="/products"
              className={`p-1 transition-colors flex items-center ${textClass} hover:text-secondary`}
              aria-label="Search products"
            >
              <Icon name="search" className="text-[24px]" />
            </Link>

            <Link
              to="/favourites"
              className={`relative p-1 transition-colors flex items-center ${textClass} hover:text-secondary`}
              aria-label="Favourites"
            >
              <Icon
                name="favorite"
                className="text-[24px]"
                style={favourites.length > 0 ? { fontVariationSettings: '"FILL" 1' } : undefined}
              />
              {favourites.length > 0 ? (
                <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {favourites.length}
                </span>
              ) : null}
            </Link>

            <Link
              to="/cart"
              className={`relative p-1 transition-colors flex items-center ${textClass} hover:text-secondary`}
              aria-label="Shopping cart"
            >
              <Icon name="shopping_cart" className="text-[24px]" />
              {totalItems > 0 ? (
                <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {totalItems}
                </span>
              ) : null}
            </Link>

            <button
              onClick={handleAuthClick}
              className={`p-1 transition-colors flex items-center focus:outline-none ${textClass} hover:text-secondary`}
              aria-label={isAuthenticated ? 'View Profile' : 'Login'}
            >
              {isAuthenticated ? (
                <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold font-display-lg uppercase shadow-sm">
                  {user?.name?.slice(0, 2) || 'US'}
                </div>
              ) : (
                <Icon name="person" className="text-[24px]" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface max-w-xs shadow-2xl transition-transform duration-300 transform md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-0 -left-72'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-margin-mobile h-16 border-b border-outline-variant">
            <span className="text-headline-sm font-bold tracking-tighter text-on-surface">
              THE FUEL STORE
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-on-surface hover:text-secondary active:scale-95 transition-all"
              aria-label="Close menu"
            >
              <Icon name="close" className="text-[24px]" />
            </button>
          </div>

          <div className="flex-1 py-md px-margin-mobile space-y-md">
            {navLinks.map((link) => {
              const active = isLinkActive(link.to);
              return (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block text-headline-sm font-headline-sm font-bold transition-all py-sm border-b border-outline-low ${
                    active ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}

            {/* Favourites mobile navigation link */}
            <NavLink
              to="/favourites"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-xs text-headline-sm font-headline-sm font-bold transition-all py-sm border-b border-outline-low ${
                location.pathname === '/favourites' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant'
              }`}
            >
              <Icon
                name="favorite"
                className="text-[24px]"
                style={favourites.length > 0 ? { fontVariationSettings: '"FILL" 1' } : undefined}
              />
              Favourites
              {favourites.length > 0 ? (
                <span className="bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {favourites.length}
                </span>
              ) : null}
            </NavLink>
          </div>

          {/* Footer inside drawer */}
          <div className="p-md border-t border-outline-variant bg-surface-container-low">
            {isAuthenticated ? (
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm uppercase">
                  {user?.name?.slice(0, 2) || 'US'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label-md font-bold truncate text-on-surface">{user?.name}</p>
                  <p className="text-label-sm truncate text-on-surface-variant">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-secondary font-bold text-label-sm hover:underline"
                >
                  Edit
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold text-center block uppercase tracking-widest text-label-md hover:bg-primary-container active:scale-95 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
