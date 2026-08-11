"use client";

import React, { useState } from 'react';

interface VariantBulkToolbarProps {
  selectedCount: number;
  totalCount: number; // for displaying "Select all X in store" if we want
  isSelectAll: boolean;
  onSelectAllDataset: () => void;
  onClearSelection: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onBulkUpdateStock: (mode: 'increase' | 'decrease' | 'replace', value: number) => void;
  onBulkUpdatePrice: (mode: 'replace' | 'add_fixed' | 'add_percent', value: number, isDiscount: boolean) => void;
  isLoading: boolean;
}

export default function VariantBulkToolbar({
  selectedCount,
  totalCount,
  isSelectAll,
  onSelectAllDataset,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onBulkUpdateStock,
  onBulkUpdatePrice,
  isLoading
}: VariantBulkToolbarProps) {
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockMode, setStockMode] = useState<'increase' | 'decrease' | 'replace'>('replace');
  const [stockValue, setStockValue] = useState<string>('');

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceMode, setPriceMode] = useState<'replace' | 'add_fixed' | 'add_percent'>('replace');
  const [priceValue, setPriceValue] = useState<string>('');
  const [isDiscountPrice, setIsDiscountPrice] = useState(false);

  const handleStockSave = () => {
    const val = parseInt(stockValue, 10);
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }
    onBulkUpdateStock(stockMode, val);
    setShowStockModal(false);
    setStockValue('');
  };

  const handlePriceSave = () => {
    const val = parseFloat(priceValue);
    if (isNaN(val)) {
      alert("Please enter a valid number.");
      return;
    }
    onBulkUpdatePrice(priceMode, val, isDiscountPrice);
    setShowPriceModal(false);
    setPriceValue('');
  };

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 mb-4 flex flex-col sm:flex-row items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
          <span className="text-indigo-800 font-medium text-sm">
            {isSelectAll ? `All ${totalCount} variants selected.` : `${selectedCount} variant${selectedCount > 1 ? 's' : ''} selected.`}
          </span>
          {!isSelectAll && totalCount > selectedCount && (
            <button onClick={onSelectAllDataset} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">
              Select all {totalCount} variants matching filter
            </button>
          )}
          <button onClick={onClearSelection} className="text-gray-500 hover:text-gray-700 text-sm">
            Clear
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={onBulkActivate}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-1">✅</span>
            Activate
          </button>
          <button
            onClick={onBulkDeactivate}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-1">❌</span>
            Deactivate
          </button>
          <button
            onClick={() => setShowStockModal(true)}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-1">📦</span>
            Update Stock
          </button>
          <button
            onClick={() => setShowPriceModal(true)}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="mr-1">💰</span>
            Update Price
          </button>
          <button
            onClick={onBulkDelete}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            <span className="mr-1">🗑️</span>
            Delete
          </button>
        </div>
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Update Stock</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={stockMode}
                    onChange={(e: any) => setStockMode(e.target.value)}
                  >
                    <option value="replace">Set exact quantity</option>
                    <option value="increase">Increase by amount</option>
                    <option value="decrease">Decrease by amount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={stockValue}
                    onChange={(e) => setStockValue(e.target.value)}
                    placeholder="e.g. 10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {stockMode === 'decrease' && "Final stock will not go below 0."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleStockSave}
              >
                Apply to {isSelectAll ? totalCount : selectedCount} Variants
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowStockModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Update Price</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Field</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={isDiscountPrice ? "true" : "false"}
                    onChange={(e) => setIsDiscountPrice(e.target.value === "true")}
                  >
                    <option value="false">Regular Price</option>
                    <option value="true">Discounted Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={priceMode}
                    onChange={(e: any) => setPriceMode(e.target.value)}
                  >
                    <option value="replace">Set exact price</option>
                    <option value="add_fixed">Add/Subtract fixed amount</option>
                    <option value="add_percent">Increase/Decrease by percentage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="number"
                    step="any"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder={priceMode === 'add_percent' ? "e.g. 10 for +10%, -10 for -10%" : "e.g. 50"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use negative numbers to decrease.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handlePriceSave}
              >
                Apply to {isSelectAll ? totalCount : selectedCount} Variants
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowPriceModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
