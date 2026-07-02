import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/getImageUrl';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery and options state
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [relatedList, setRelatedList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    getProductById(id)
      .then((data) => {
        setProduct(data);
        setActiveImage(data.image);
        // Default size to the first available size
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        setQuantity(1);

        // Fetch related products (same category, max 4)
        getProducts({ category: data.category })
          .then((allProducts) => {
            const matching = allProducts.filter(p => p.id !== data.id).slice(0, 4);
            setRelatedList(matching);
          });
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    addToCart(product, quantity, selectedSize);
    
    // Animate cart badge response
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  const incrementQty = () => setQuantity(q => q + 1);
  const decrementQty = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl text-center">
        <Icon name="sync" className="animate-spin text-5xl text-secondary" />
        <p className="mt-md text-on-surface-variant font-bold">Loading Kit Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl text-center">
        <Icon name="error" className="text-5xl text-secondary mb-md" />
        <h3 className="text-headline-md font-bold">Failed to Load Jersey</h3>
        <p className="text-on-surface-variant mt-sm mb-lg">{error || 'Product not found'}</p>
        <Link to="/products" className="bg-primary text-on-primary px-lg py-sm font-bold uppercase rounded-lg">
          Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-label-sm font-label-sm text-on-surface-variant mb-lg select-none">
        <Link to="/" className="hover:text-primary">Home</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary capitalize">
          {product.category?.replace('-', ' ')}
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface font-semibold truncate">{product.name}</span>
      </nav>

      {/* 2. Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:gap-xl">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-gutter">
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 ? (
            <div className="flex md:flex-col gap-sm overflow-x-auto md:overflow-y-auto no-scrollbar max-h-[500px]">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 h-24 bg-surface-container rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 focus:outline-none ${
                    activeImage === img ? 'border-primary' : 'border-outline-variant/30'
                  }`}
                >
                  <img src={getImageUrl(img)} alt={`${product.name} View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Large Main Image Display */}
          <div className="flex-1 aspect-[4/5] bg-surface-container rounded-xl overflow-hidden relative group shadow-sm border border-outline-variant/30">
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out cursor-zoom-in ${
                isZoomed ? 'scale-150' : 'group-hover:scale-105'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-md p-base rounded-full hover:bg-white transition-all text-on-surface hover:text-secondary focus:outline-none"
              aria-label="Zoom image"
            >
              <Icon name={isZoomed ? 'zoom_out' : 'zoom_in'} className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Right Column: Options & Buy */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-md">
            <div>
              {product.badge ? (
                <Badge variant={product.badge} className="mb-sm">
                  {product.badge}
                </Badge>
              ) : (
                <Badge variant="primary" className="mb-sm bg-primary/20 text-primary border border-primary/20">
                  {product.type || 'Official Jersey'}
                </Badge>
              )}
              <h2 className="text-headline-md font-display-lg font-bold text-on-surface tracking-tight leading-tight uppercase">
                {product.name}
              </h2>
            </div>

            {/* Pricing block */}
            <div className="flex items-center gap-sm">
              <span className="text-headline-sm font-headline-sm font-bold text-secondary">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice ? (
                <span className="text-label-md font-label-md text-on-surface-variant line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              ) : null}
            </div>

            <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 ? (
              <div className="space-y-base">
                <div className="flex justify-between items-center text-label-md font-label-md">
                  <span className="text-on-surface font-bold uppercase tracking-wider">Select Size</span>
                  <a href="#guide" className="text-secondary hover:underline text-label-sm font-semibold">
                    Size Guide
                  </a>
                </div>
                <div className="grid grid-cols-4 gap-sm select-none">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-12 border-2 flex items-center justify-center font-bold text-label-md rounded-lg active:scale-95 transition-all focus:outline-none ${
                        selectedSize === sz
                          ? 'border-primary bg-primary text-on-primary shadow-sm'
                          : 'border-outline-variant/65 text-on-surface hover:border-primary'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity Controls and Buy CTA */}
            <div className="flex gap-gutter pt-sm">
              <div className="flex items-center border border-outline-variant rounded-lg h-14 px-sm bg-surface-container-low select-none">
                <button
                  onClick={decrementQty}
                  className="p-xs text-on-surface hover:text-secondary transition-colors focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Icon name="remove" className="text-[20px]" />
                </button>
                <span className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold text-body-md">
                  {quantity}
                </span>
                <button
                  onClick={incrementQty}
                  className="p-xs text-on-surface hover:text-secondary transition-colors focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Icon name="add" className="text-[20px]" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                variant="secondary"
                className="flex-1 h-14 gap-sm text-label-md shadow-md rounded-lg"
              >
                <Icon name="shopping_bag" className="text-[22px]" />
                {isAdding ? 'ADDING TO CART...' : 'ADD TO CART'}
              </Button>
            </div>

            {/* Promises and trust row */}
            <div className="space-y-md border-t border-outline-variant/30 pt-lg mt-lg">
              <div className="flex gap-sm">
                <Icon name="local_shipping" className="text-secondary text-[24px]" />
                <div>
                  <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider">Free Express Shipping</h4>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">On orders over $150. Delivery in 2-4 business days.</p>
                </div>
              </div>
              <div className="flex gap-sm">
                <Icon name="verified" className="text-secondary text-[24px]" />
                <div>
                  <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider">Authentic Guarantee</h4>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">Official licensed merchandise with verified tags.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Technical Precision Specs */}
      {product.features && product.features.length > 0 ? (
        <section className="mt-xl py-xl border-t border-outline-variant/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            <div className="lg:col-span-5">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-md uppercase tracking-wide">
                Technical Precision
              </h3>
              <p className="text-body-md font-body-md text-on-surface-variant mb-lg leading-relaxed">
                Designed for high intensity performance. Engineered for elite athletes, this official kit combines heat-mapping laser perforation with sustainable, ultra-lightweight mesh to maximize acceleration and airflow on the pitch.
              </p>
              <ul className="space-y-sm">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-sm text-label-md text-on-surface">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Detailed design photos placeholder from index */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-base">
              <div className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDendXpD-kXXngvZukkNfV23sD9RzuTmlENuiWlRe1b_twudoHbBTouzSpb_4RWL4mbg_u2ERb4DvAptw9SJxc97obiXcLimpM8onlrwC3Zds0zDcrtMmwst_yvH27W3FlI5msKkhGljzV3WrJZEmm2OTncqRnCxxGpEM1tdGS6DHQfZnZEUScMTW01isZbPrkyw0YIh7qbgof6y31Cy6-qMyHEWUXRgqB7mGpwqKrtfZNcH4wSw17qFeqrKU0hqeL7BPqUq5BGzBU"
                  alt="Embroidery details closeup"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="aspect-square bg-surface-container rounded-xl overflow-hidden shadow-sm border border-outline-variant/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7fK5Qrsp6oOoiCuj_FnHOSEkBglQBHfdzF9hYUk8TfzIEyC6XteVv7okiXAo59JBaRw1npClAvMOxueavnknhVRfykYSogDfstVXvPnZEHgTOjIlufuvaq4DbGzhVf5TeKEI_QBM3zBjjeFrprzA-nGqJqiQRy8S19QUv6Qn_ROkWUBHaxw6rFsRiJ9az2oWVnWDO_WmUdjmn8fr-ysVVIAcJ4ScL7C8aKQUprWXs5hpTlNsrDfT5_sp0Drp9zrt6lveJqx8lLqA"
                  alt="Breathing texture mesh closeup"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Complete the Look recommendations */}
      {relatedList.length > 0 ? (
        <section className="mt-xl border-t border-outline-variant/30 pt-xl">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <span className="text-label-sm font-bold text-secondary uppercase tracking-widest block mb-xs">
                Perfect Match
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight">
                Complete the Look
              </h3>
            </div>
            <button
              onClick={() => navigate('/products?category=accessories')}
              className="text-label-md font-bold text-secondary hover:underline flex items-center gap-xs focus:outline-none"
            >
              SHOP ACCESSORIES <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {relatedList.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/products/${item.id}`)}
                className="group cursor-pointer bg-surface-container-lowest p-sm border border-outline-variant/30 rounded-xl hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden mb-sm relative">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-bold text-label-md text-on-surface group-hover:text-secondary transition-colors line-clamp-2 min-h-[40px] uppercase leading-tight">
                  {item.name}
                </h4>
                <p className="text-label-sm font-bold text-secondary mt-1">{formatCurrency(item.price)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
