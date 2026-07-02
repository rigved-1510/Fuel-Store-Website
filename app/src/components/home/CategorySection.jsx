import React from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../data/categories';
import { Icon } from '../ui/Icon';

export function CategorySection() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <section className="py-lg bg-surface">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Header */}
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-headline-md font-headline-md text-on-surface">Global Elite</h3>
          <button
            onClick={() => navigate('/products')}
            className="text-secondary hover:text-secondary-container font-bold text-label-md flex items-center gap-xs focus:outline-none transition-colors"
          >
            View All <Icon name="chevron_right" className="text-[18px]" />
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex gap-gutter overflow-x-auto no-scrollbar pb-base select-none">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex-shrink-0 group cursor-pointer text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container transition-all duration-300 mb-base shadow-sm">
                <Icon
                  name={cat.icon}
                  className="text-4xl text-on-surface group-hover:text-on-secondary-container transition-colors duration-300"
                />
              </div>
              <span className="text-label-sm md:text-label-md font-label-md text-on-surface-variant group-hover:text-primary group-hover:font-semibold transition-all">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
