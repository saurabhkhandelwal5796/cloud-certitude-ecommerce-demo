"use client";

import React, { useState, memo } from 'react';

interface VariantFiltersProps {
  products: { id: string; name: string }[];
  filters: {
    productId: string;
    status: string;
    stock: string;
    minPrice: string;
    maxPrice: string;
    fromDate: string;
    toDate: string;
  };
  onChange: (filters: any) => void;
  onClear: () => void;
}

export default memo(function VariantFilters({ products, filters, onChange, onClear }: VariantFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="w-5 h-5 mr-2 -ml-1 text-gray-400 flex items-center justify-center">⚙️</span>
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        {activeCount > 0 && (
          <button
            onClick={() => {
              onClear();
              setIsOpen(false);
            }}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
          >
            <span className="w-4 h-4 mr-1 flex items-center justify-center">❌</span>
            Clear All
          </button>
        )}
      </div>

      {isOpen && (
        <div className="p-4 mt-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Product Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Product</label>
              <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                value={filters.productId}
                onChange={(e) => handleChange('productId', e.target.value)}
              >
                <option value="">All Products</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Status</label>
              <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Stock Level</label>
              <select
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                value={filters.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock (&gt;0)</option>
                <option value="low_stock">Low Stock (1-10)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                  value={filters.minPrice}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                  value={filters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Created Date</label>
              <div className="flex space-x-4 items-center">
                <div className="flex-1 max-w-xs">
                  <input
                    type="date"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                    value={filters.fromDate}
                    onChange={(e) => handleChange('fromDate', e.target.value)}
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1 max-w-xs">
                  <input
                    type="date"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                    value={filters.toDate}
                    onChange={(e) => handleChange('toDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
});
