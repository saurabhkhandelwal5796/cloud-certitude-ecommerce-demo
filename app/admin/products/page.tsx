"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { getProducts, saveProduct, deleteProduct, AdminProduct } from "@/services/AdminService";

const CATEGORIES = ["Men", "Women", "Kids", "New Arrivals", "Sale"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Beige", "Black", "Charcoal", "Cream", "White", "Blue", "Olive", "Blush"];

/**
 * AdminProductsPage Component
 *
 * Provides comprehensive product inventory management (CRUD).
 * Styled in matching premium cream aesthetics with glassmorphic modals.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [price, setPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    getProducts()
      .then((list) => {
        setProducts(list);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("[Products] Error fetching list:", err);
        setIsLoading(false);
      });
  }, [refreshTrigger]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setBrand("");
    setDescription("");
    setCategory("Men");
    setPrice("");
    setDiscountPercent("");
    setStockQuantity("");
    setImageSrc("");
    setSelectedSizes(["M", "L"]);
    setSelectedColors(["Beige"]);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setDescription(p.description);
    setCategory(p.category);
    setPrice(p.price.toString());
    setDiscountPercent(p.discountPercent ? p.discountPercent.toString() : "");
    setStockQuantity(p.stockQuantity.toString());
    setImageSrc(p.imageSrc);
    setSelectedSizes(p.size);
    setSelectedColors(p.color);
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      await deleteProduct(id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!name.trim()) return setFormError("Product name is required.");
    if (!brand.trim()) return setFormError("Brand is required.");
    if (!description.trim()) return setFormError("Description is required.");
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return setFormError("Price must be a valid positive number.");
    }
    if (discountPercent && (isNaN(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100)) {
      return setFormError("Discount percentage must be between 0 and 100.");
    }
    if (!stockQuantity || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      return setFormError("Stock quantity must be a non-negative number.");
    }
    if (!imageSrc.trim() || !imageSrc.startsWith("http")) {
      return setFormError("Please enter a valid product image URL.");
    }
    if (selectedSizes.length === 0) {
      return setFormError("Please select at least one product size.");
    }
    if (selectedColors.length === 0) {
      return setFormError("Please select at least one product color.");
    }

    const payload: AdminProduct = {
      id: editingProduct ? editingProduct.id : `product_${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      stockQuantity: Number(stockQuantity),
      imageSrc: imageSrc.trim(),
      images: [imageSrc.trim()],
      size: selectedSizes,
      color: selectedColors,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      sku: editingProduct ? editingProduct.sku : `CC-${brand.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    };

    try {
      await saveProduct(payload);
      setShowModal(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch {
      setFormError("Failed to save product. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading product listings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
            Products Inventory
          </h1>
          <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
            Manage catalogue, prices, descriptions, sizing, and categories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 uppercase tracking-wider cursor-pointer"
        >
          + Add Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-6 font-semibold">Image</th>
                <th className="py-4 px-6 font-semibold">Product Name</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Price</th>
                <th className="py-4 px-6 font-semibold">Stock</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <Image
                      src={p.imageSrc}
                      alt={p.name}
                      width={40}
                      height={48}
                      className="h-12 w-10 object-cover rounded-lg border border-stone-100 bg-stone-50"
                    />
                  </td>
                  <td className="py-3 px-6">
                    <div>
                      <span className="block font-bold text-stone-900 text-sm">
                        {p.name}
                      </span>
                      <span className="block text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">
                        {p.brand} &middot; SKU: {p.sku || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-medium text-stone-650">
                    {p.category}
                  </td>
                  <td className="py-3 px-6 font-bold text-stone-900">
                    {p.discountPercent ? (
                      <div>
                        <span>{formatPrice(p.price * (1 - p.discountPercent / 100))}</span>
                        <span className="block text-[10px] text-stone-400 line-through font-light mt-0.5">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    ) : (
                      formatPrice(p.price)
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block font-extrabold rounded-full px-3 py-0.5 text-[9px] uppercase tracking-wider ${
                        p.stockQuantity === 0
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : p.stockQuantity < 10
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {p.stockQuantity === 0 ? "Out of Stock" : `${p.stockQuantity} Left`}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-stone-500 hover:text-stone-850 font-bold tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-rose-400 hover:text-rose-600 font-bold tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white/95 border border-white/50 shadow-2xl rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl flex flex-col space-y-6 transform scale-100 transition-transform duration-300 animate-zoom-in">
            
            {/* Title */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900 uppercase tracking-wide">
                {editingProduct ? "Edit Product Details" : "Create New Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                ⚠️ {formError}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs text-stone-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tailored Summer Linen Blazer"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Atelier Certitude"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-bold uppercase tracking-wider text-stone-500">
                  Product Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the product materials, fit guidelines, styling suggestions, and finish quality..."
                  rows={3}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Category */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="35"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Product Image (Unsplash / CDN URL) *
                  </label>
                  <input
                    type="text"
                    value={imageSrc}
                    onChange={(e) => setImageSrc(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>

                {/* Discount Percentage */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase tracking-wider text-stone-500">
                    Discount Percent (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="15"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                  />
                </div>
              </div>

              {/* Sizes Selection */}
              <div className="space-y-2">
                <label className="block font-bold uppercase tracking-wider text-stone-500">
                  Select Available Sizes *
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {SIZES.map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-4 py-2 border rounded-xl font-bold uppercase transition-all cursor-pointer ${
                          active
                            ? "bg-[#E0A99E] border-[#E0A99E] text-white shadow-sm"
                            : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Selection */}
              <div className="space-y-2">
                <label className="block font-bold uppercase tracking-wider text-stone-500">
                  Select Available Colors *
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((col) => {
                    const active = selectedColors.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleColor(col)}
                        className={`px-4 py-2 border rounded-xl font-bold uppercase transition-all cursor-pointer ${
                          active
                            ? "bg-stone-900 border-stone-900 text-white shadow-sm"
                            : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3.5 border-t border-stone-100 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-stone-200 px-6 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-8 py-2.5 text-xs font-bold text-white hover:bg-stone-850 transition-all shadow-md uppercase tracking-wider cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
