import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts, deleteProduct } from '../../services/adminService';
import { getImageUrl } from '../../utils/getImageUrl';

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products list.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                            p.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading product catalog...</p>
      </div>
    );
  }

  // Get unique categories for filter dropdown
  const categoriesList = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Products</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, update and upload products to your storefront.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-xl font-bold tracking-wide transition shadow-lg shadow-amber-500/10 text-sm"
        >
          <span className="material-icons text-base">add</span>
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-4 border border-slate-800 rounded-2xl shadow-lg">
        {/* Search */}
        <div className="flex-1 relative flex items-center">
          <span className="material-icons text-slate-500 absolute left-4 text-lg">search</span>
          <input
            type="text"
            placeholder="Search by name, club or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 placeholder-slate-500 rounded-xl outline-none text-sm transition-all"
          />
        </div>
        {/* Category Filter */}
        <div className="w-full md:w-56 relative flex items-center">
          <span className="material-icons text-slate-500 absolute left-4 text-lg">filter_alt</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-11 pr-8 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 rounded-xl outline-none text-sm transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
          <span className="material-icons text-slate-500 absolute right-4 text-base pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-icons text-slate-600 text-4xl mb-3">inventory</span>
            <p className="text-slate-400 font-medium">No products match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 text-xs font-bold tracking-wider uppercase">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-3">Club / League</th>
                  <th className="py-4 px-3">Category</th>
                  <th className="py-4 px-3">Price</th>
                  <th className="py-4 px-3">Stock</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProducts.map((p) => {
                  // Resolve total stock
                  const totalStock = Object.values(p.stock || {}).reduce((sum, val) => sum + val, 0);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-all">
                      {/* Name / Slug */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(p.image)}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-800 bg-slate-950"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x100/1e293b/94a3b8?text=Product';
                            }}
                          />
                          <div>
                            <span className="font-semibold text-white block leading-tight">{p.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      {/* Club / League */}
                      <td className="py-4 px-3">
                        <div className="leading-tight">
                          <span className="font-medium text-slate-200 block text-xs">{p.club}</span>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">
                            {p.league || 'NONE'}
                          </span>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="py-4 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {p.category}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="py-4 px-3">
                        <div className="leading-tight">
                          <span className="font-bold text-white block">₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                          {p.discountPercent > 0 && (
                            <span className="text-[10px] text-emerald-400 font-bold tracking-wide mt-0.5 block">
                              -{p.discountPercent}% Off
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Stock */}
                      <td className="py-4 px-3">
                        <span className={`font-semibold ${totalStock === 0 ? 'text-red-400' : totalStock < 20 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {totalStock} units
                        </span>
                      </td>
                      {/* Status */}
                      <td className="py-4 px-3">
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            p.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                              : 'bg-red-500/10 text-red-400 border border-red-500/25'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Edit"
                          >
                            <span className="material-icons text-base">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <span className="material-icons text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
