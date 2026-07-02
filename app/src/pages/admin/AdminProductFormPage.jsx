import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminProducts, createProduct, updateProduct } from '../../services/adminService';
import { getImageUrl } from '../../utils/getImageUrl';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '5'];
const CATEGORIES = [
  { id: 1, name: 'Jersey' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Accessories' }
];
const LEAGUES = [
  { value: '', label: 'None (For accessories/clothing)' },
  { value: 'premier-league', label: 'Premier League' },
  { value: 'la-liga', label: 'La Liga' },
  { value: 'serie-a', label: 'Serie A' },
  { value: 'bundesliga', label: 'Bundesliga' },
  { value: 'ligue-1', label: 'Ligue 1' },
  { value: 'international', label: 'International (Euro/Copa)' }
];

export function AdminProductFormPage() {
  const { id } = useParams(); // If present, we are in edit mode
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [club, setClub] = useState('');
  const [league, setLeague] = useState('');
  const [season, setSeason] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Sizes Stock mapping (e.g. { S: 10, M: 25 })
  const [sizeStock, setSizeStock] = useState(
    AVAILABLE_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );

  // Image files upload state
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  async function loadProduct() {
    try {
      setLoading(true);
      const productsList = await getAdminProducts();
      const product = productsList.find(p => p.id === parseInt(id, 10));
      if (!product) {
        throw new Error('Product not found in store catalog.');
      }

      setName(product.name);
      setSlug(product.slug);
      setClub(product.club);
      setLeague(product.league || '');
      setSeason(product.season || '');
      setCategoryId(product.categoryId || 1);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setDiscountPercent((product.discountPercent || 0).toString());
      setFeatured(!!product.featured);
      setIsActive(!!product.isActive);
      setExistingImages(product.images || []);

      // Populate size stock
      const stockMap = AVAILABLE_SIZES.reduce((acc, size) => {
        acc[size] = product.stock?.[size] || 0;
        return acc;
      }, {});
      setSizeStock(stockMap);
    } catch (err) {
      setError(err.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }

  // Handle stock changes
  const handleStockChange = (size, value) => {
    const val = parseInt(value, 10);
    setSizeStock(prev => ({
      ...prev,
      [size]: isNaN(val) ? 0 : val
    }));
  };

  // Handle file select
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new Error('Slug must consist of lowercase letters, numbers, and hyphens only.');
      }

      const pVal = parseFloat(price);
      if (isNaN(pVal) || pVal < 0) {
        throw new Error('Price must be a valid positive number.');
      }

      // Compile sizes format expected by backend: array of { name, stock }
      const sizesArray = Object.entries(sizeStock)
        .filter(([_, stock]) => stock > 0)
        .map(([name, stock]) => ({ name, stock }));

      // Construct FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('club', club);
      formData.append('league', league);
      formData.append('season', season);
      formData.append('categoryId', categoryId.toString());
      formData.append('description', description);
      formData.append('price', price);
      formData.append('discountPercent', discountPercent || '0');
      formData.append('featured', featured ? '1' : '0');
      formData.append('isActive', isActive ? '1' : '0');
      formData.append('sizes', JSON.stringify(sizesArray));

      // Append files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (isEditMode) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Operation failed. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Fetching product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Breadcrumbs / Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            <Link to="/admin/products" className="hover:text-amber-500 transition">Products</Link>
            <span className="material-icons text-[12px]">chevron_right</span>
            <span className="text-slate-300">{isEditMode ? 'Edit Product' : 'Add New'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            {isEditMode ? 'Edit Product' : 'Create Product'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span className="material-icons">error_outline</span>
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          {/* Section: General Info */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-base mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">info</span>
              <span>General Information</span>
            </h3>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">PRODUCT NAME</label>
            <input
              type="text"
              required
              placeholder="e.g. Real Madrid 24/25 Home Jersey"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Auto generate slug if creating
                if (!isEditMode) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }
              }}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm transition"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">SLUG / PRODUCT ID</label>
            <input
              type="text"
              required
              placeholder="e.g. real-madrid-home-2425"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm font-mono transition"
            />
          </div>

          {/* Club */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">CLUB</label>
            <input
              type="text"
              required
              placeholder="e.g. Real Madrid"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm transition"
            />
          </div>

          {/* League */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">LEAGUE</label>
            <select
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm cursor-pointer transition"
            >
              {LEAGUES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">SEASON</label>
            <input
              type="text"
              placeholder="e.g. 2024/25"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm transition"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">CATEGORY</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm cursor-pointer transition"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">DESCRIPTION</label>
            <textarea
              rows={4}
              placeholder="Provide a detailed description of the product design, fabric, features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          {/* Section: Price & Inventory */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-base mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">sell</span>
              <span>Pricing & Settings</span>
            </h3>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">PRICE (INR)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 1200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm transition"
            />
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold text-xs tracking-wide">DISCOUNT (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 10"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500 rounded-xl outline-none text-sm transition"
            />
          </div>

          {/* Featured & Active Switches */}
          <div className="flex items-center gap-8 py-2 md:col-span-2 border-t border-slate-800 mt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 accent-amber-500 bg-slate-950 border border-slate-800 rounded focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300 text-sm font-semibold tracking-wide">Mark as Featured Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 accent-amber-500 bg-slate-950 border border-slate-800 rounded focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300 text-sm font-semibold tracking-wide">Publish Product (Active)</span>
            </label>
          </div>
        </div>

        {/* Sizes stock grid */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div>
            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">square_foot</span>
              <span>Sizes & Stock Quantities</span>
            </h3>
            <p className="text-slate-500 text-xs font-semibold">Define the stock levels for each size. Set to 0 to disable size.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {AVAILABLE_SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-center font-bold text-white text-xs py-1 border-b border-slate-800">{size}</span>
                <input
                  type="number"
                  min="0"
                  value={sizeStock[size]}
                  onChange={(e) => handleStockChange(size, e.target.value)}
                  className="w-full text-center py-1.5 bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-200 outline-none text-xs rounded-lg font-bold"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Images uploads */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div>
            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">photo_library</span>
              <span>Product Images</span>
            </h3>
            <p className="text-slate-500 text-xs font-semibold">Upload product photos. Recommended dimensions: 600x600 px (WEBP/PNG/JPEG).</p>
          </div>

          {/* Upload Dropzone */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-slate-950 p-8 rounded-xl transition hover:border-amber-500/50">
            <span className="material-icons text-slate-500 text-4xl mb-2">cloud_upload</span>
            <span className="text-slate-300 font-semibold text-xs tracking-wider mb-2">UPLOAD PRODUCT PHOTOS</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs text-slate-500 cursor-pointer w-full max-w-xs text-center border border-slate-850 p-2 rounded-lg bg-slate-900 font-medium"
            />
          </div>

          {/* Preview Preexisting / Newly selected images */}
          {(imagePreviews.length > 0 || existingImages.length > 0) && (
            <div className="space-y-4">
              <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Preview Selected Photos</h4>
              <div className="flex flex-wrap gap-4">
                {/* Preexisting */}
                {imagePreviews.length === 0 && existingImages.map((img, i) => {
                  return (
                    <div key={i} className="relative group border border-slate-850 rounded-xl overflow-hidden">
                      <img src={getImageUrl(img)} alt="existing" className="w-24 h-24 object-cover" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-slate-900 text-amber-500 border border-slate-800">
                        Current
                      </span>
                    </div>
                  );
                })}
                {/* Previews of newly selected */}
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative group border border-slate-850 rounded-xl overflow-hidden">
                    <img src={preview} alt="preview" className="w-24 h-24 object-cover" />
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-amber-500 text-slate-950 border border-slate-600">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-slate-800 pt-6">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold tracking-wide rounded-xl transition text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3 rounded-xl font-bold tracking-wide transition shadow-lg shadow-amber-500/10 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <span className="material-icons text-base">save</span>
                <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
