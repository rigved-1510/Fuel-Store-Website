import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { categories } from '../data/categories';
import { Icon } from '../components/ui/Icon';
import { formatCurrency } from '../utils/formatCurrency';

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State variables for filter values
  const [search, setSearch] = useState('');
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [maxPrice, setMaxPrice] = useState(1499);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Products and loading state
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active query parameters
  const categoryParam = searchParams.get('category') || 'all';
  const filterParam = searchParams.get('filter') || 'all';

  // Price nodes for the clickable price filter
  const priceNodes = [599, 799, 999, 1299, 1499];

  // Available clubs in mock database
  const clubs = [
    "Manchester City",
    "Real Madrid",
    "Arsenal FC",
    "AC Milan",
    "FC Barcelona",
    "Bayern Munich"
  ];

  const sizes = ["S", "M", "L", "XL", "XXL"];

  // Fetch and filter products whenever filters or params change
  useEffect(() => {
    setLoading(true);
    // Scroll to top on list navigate
    window.scrollTo(0, 0);

    getProducts({
      category: categoryParam,
      search: search,
      clubs: selectedClubs,
      maxPrice: maxPrice
    })
      .then((data) => {
        let filtered = data;

        // If category is 'all', only display jerseys (exclude accessories)
        if (categoryParam === 'all') {
          filtered = filtered.filter(p => p.category !== 'accessories');
        }

        // Extra client-side filters
        if (filterParam === 'sale') {
          filtered = filtered.filter(p => p.badge === 'sale' || p.originalPrice > 0);
        } else if (filterParam === 'new') {
          filtered = filtered.filter(p => p.badge === 'new');
        }

        if (selectedSize) {
          filtered = filtered.filter(p => p.sizes && p.sizes.includes(selectedSize));
        }

        setProductsList(filtered);
      })
      .finally(() => setLoading(false));
  }, [categoryParam, filterParam, search, selectedClubs, selectedSize, maxPrice]);

  const handleClubChange = (club) => {
    setSelectedClubs(prev => 
      prev.includes(club) 
        ? prev.filter(c => c !== club) 
        : [...prev, club]
    );
  };

  const handleSizeClick = (size) => {
    setSelectedSize(prev => prev === size ? null : size);
  };

  const handleCategoryChange = (catId) => {
    setSearchParams({ category: catId, filter: filterParam });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedClubs([]);
    setSelectedSize(null);
    setMaxPrice(1499);
    setSearchParams({});
  };

  const activeCategoryName = categoryParam === 'all' 
    ? 'All Jerseys' 
    : categoryParam === 'clothing'
    ? 'Clothing'
    : categories.find(c => c.id === categoryParam)?.name || categoryParam;

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md min-h-screen">
      
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-label-sm font-label-sm text-on-surface-variant mb-base select-none">
        <span className="cursor-pointer hover:text-primary" onClick={() => handleCategoryChange('all')}>Home</span>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-primary font-semibold">{activeCategoryName}</span>
      </nav>

      {/* 2. Page Header */}
      <section className="mb-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary tracking-tight uppercase">
              {filterParam === 'sale' ? 'CLEARANCE SALE' : filterParam === 'new' ? 'NEW ARRIVALS' : activeCategoryName}
            </h2>
            <p className="text-body-md text-on-surface-variant mt-xs">
              Premium performance kits for every pitch. ({productsList.length} items found)
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team, player or kit..."
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary text-body-md pr-10 outline-none transition-shadow"
            />
            <Icon name="search" className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 3. Columns Grid */}
      <div className="flex flex-col md:flex-row gap-lg">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center bg-surface-container p-sm rounded-lg">
          <span className="font-bold text-label-md">FILTERS</span>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-xs text-secondary font-bold text-label-sm"
          >
            <Icon name="filter_list" /> SHOW FILTERS
          </button>
        </div>

        {/* Sidebar: Filters Column (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-lg bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
            
            {/* Active Categories Links */}
            <div className="space-y-sm">
              <h3 className="text-label-md font-label-md font-bold uppercase tracking-widest text-primary">Leagues</h3>
              <div className="flex flex-col gap-xs">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`text-left text-body-md py-xs px-sm rounded transition-colors ${
                    categoryParam === 'all' ? 'bg-secondary text-on-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategoryChange(c.id)}
                    className={`text-left text-body-md py-xs px-sm rounded transition-colors ${
                      categoryParam === c.id ? 'bg-secondary text-on-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Team/Club Filter */}
            <div className="space-y-sm pt-sm border-t border-outline-variant/30">
              <h3 className="text-label-md font-label-md font-bold uppercase tracking-widest text-primary">Clubs</h3>
              <div className="space-y-xs max-h-48 overflow-y-auto filter-sidebar pr-xs">
                {clubs.map((club) => (
                  <label key={club} className="flex items-center gap-sm group cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedClubs.includes(club)}
                      onChange={() => handleClubChange(club)}
                      className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary accent-secondary"
                    />
                    <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                      {club}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter Chips */}
            <div className="space-y-sm pt-sm border-t border-outline-variant/30">
              <h3 className="text-label-md font-label-md font-bold uppercase tracking-widest text-primary">Size</h3>
              <div className="flex flex-wrap gap-xs">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeClick(sz)}
                    className={`px-md py-xs border text-label-md font-label-md rounded hover:border-primary active:scale-95 transition-all ${
                      selectedSize === sz
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'border-outline text-on-surface-variant'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Node Selector */}
            <div className="space-y-sm pt-sm border-t border-outline-variant/30">
              <h3 className="text-label-md font-label-md font-bold uppercase tracking-widest text-primary">Max Price</h3>
              <div className="relative pt-xs pb-xs">
                {/* Track */}
                <div className="relative h-1 bg-outline-variant/40 rounded-full mx-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-secondary rounded-full transition-all duration-300"
                    style={{ width: `${(priceNodes.indexOf(maxPrice) / (priceNodes.length - 1)) * 100}%` }}
                  />
                </div>
                {/* Nodes */}
                <div className="flex justify-between mt-xs">
                  {priceNodes.map((p) => (
                    <button
                      key={p}
                      onClick={() => setMaxPrice(p)}
                      className="flex flex-col items-center gap-1 group"
                      title={formatCurrency(p)}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                        maxPrice >= p
                          ? 'bg-secondary border-secondary scale-110'
                          : 'bg-surface border-outline-variant group-hover:border-secondary'
                      }`} />
                      <span className={`text-[10px] font-bold leading-none ${
                        maxPrice === p ? 'text-secondary' : 'text-on-surface-variant group-hover:text-primary'
                      }`}>
                        {p}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear All Filters */}
            <button
              onClick={handleClearFilters}
              className="w-full py-sm border-2 border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary font-bold rounded-lg transition-colors text-label-md uppercase tracking-wider"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Main Content Grid Column */}
        <section className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="animate-pulse bg-surface-container rounded-xl aspect-[3/4] w-full" />
              ))}
            </div>
          ) : productsList.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/60">
              <Icon name="search_off" className="text-5xl text-on-surface-variant mb-md" />
              <h4 className="text-headline-sm font-headline-sm mb-xs">Currently Unavailable</h4>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-gutter animate-fade-in-up">
              {productsList.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filter Slide-out Drawer */}
      {showMobileFilters && (
        <>
          <div
            onClick={() => setShowMobileFilters(false)}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs"
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-surface p-md shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-lg pb-base border-b border-outline-variant">
                <span className="font-bold text-headline-sm">FILTERS</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:text-secondary"
                >
                  <Icon name="close" />
                </button>
              </div>

              {/* Leagues Selection */}
              <div className="space-y-sm mb-md">
                <h3 className="text-label-md font-bold uppercase tracking-wider text-primary">Leagues</h3>
                <div className="flex flex-wrap gap-xs">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-sm py-1 rounded text-label-sm border ${
                      categoryParam === 'all' ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant text-on-surface-variant'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className={`px-sm py-1 rounded text-label-sm border ${
                        categoryParam === c.id ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clubs Selection */}
              <div className="space-y-sm mb-md pt-sm border-t border-outline-variant/30">
                <h3 className="text-label-md font-bold uppercase tracking-wider text-primary">Clubs</h3>
                <div className="grid grid-cols-2 gap-sm">
                  {clubs.map((club) => (
                    <label key={club} className="flex items-center gap-xs cursor-pointer select-none text-body-md text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={selectedClubs.includes(club)}
                        onChange={() => handleClubChange(club)}
                        className="w-4 h-4 rounded border-outline text-secondary focus:ring-secondary accent-secondary"
                      />
                      <span className="truncate">{club}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-sm mb-md pt-sm border-t border-outline-variant/30">
                <h3 className="text-label-md font-bold uppercase tracking-wider text-primary">Size</h3>
                <div className="flex flex-wrap gap-xs">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSizeClick(sz)}
                      className={`px-md py-xs border text-label-sm font-bold rounded ${
                        selectedSize === sz ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Node Selector (Mobile) */}
              <div className="space-y-sm pt-sm border-t border-outline-variant/30 mb-lg">
                <h3 className="text-label-md font-bold uppercase tracking-wider text-primary">Max Price</h3>
                <div className="relative pt-xs pb-xs">
                  <div className="relative h-1 bg-outline-variant/40 rounded-full mx-2">
                    <div
                      className="absolute left-0 top-0 h-full bg-secondary rounded-full transition-all duration-300"
                      style={{ width: `${(priceNodes.indexOf(maxPrice) / (priceNodes.length - 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-xs">
                    {priceNodes.map((p) => (
                      <button
                        key={p}
                        onClick={() => setMaxPrice(p)}
                        className="flex flex-col items-center gap-1 group"
                        title={formatCurrency(p)}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                          maxPrice >= p
                            ? 'bg-secondary border-secondary scale-110'
                            : 'bg-surface border-outline-variant group-hover:border-secondary'
                        }`} />
                        <span className={`text-[10px] font-bold leading-none ${
                          maxPrice === p ? 'text-secondary' : 'text-on-surface-variant group-hover:text-primary'
                        }`}>
                          {p}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-base border-t border-outline-variant pt-md bg-surface">
              <button
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 py-sm border border-outline-variant text-center font-bold rounded-lg text-label-md uppercase"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-sm bg-secondary text-on-secondary text-center font-bold rounded-lg text-label-md uppercase hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
