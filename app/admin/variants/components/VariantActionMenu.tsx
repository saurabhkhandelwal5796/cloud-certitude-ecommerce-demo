"use client";

import React, { useState, useRef, useEffect, memo } from 'react';

interface VariantActionMenuProps {
  isActive: boolean;
  isPrimary: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

export default memo(function VariantActionMenu({ isActive, isPrimary, onEdit, onDuplicate, onToggleActive, onDelete, onSetPrimary }: VariantActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
      >
        <span className="flex items-center justify-center w-5 h-5 pb-2 text-xl font-bold leading-none tracking-[2px]">...</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <span className="w-4 h-4 mr-2">✏️</span>
              Edit Variant
            </button>
            <button
              onClick={() => { onDuplicate(); setIsOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <span className="w-4 h-4 mr-2">📄</span>
              Duplicate
            </button>
            {!isPrimary && (
              <button
                onClick={() => { onSetPrimary(); setIsOpen(false); }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <span className="w-4 h-4 mr-2">⭐</span>
                Set as Primary
              </button>
            )}
            <button
              onClick={() => { onToggleActive(); setIsOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              {isActive ? (
                <>
                  <span className="w-4 h-4 mr-2 text-red-500 flex items-center justify-center">❌</span>
                  Deactivate
                </>
              ) : (
                <>
                  <span className="w-4 h-4 mr-2 text-green-500 flex items-center justify-center">✅</span>
                  Activate
                </>
              )}
            </button>
            <div className="border-t border-gray-100 mt-1"></div>
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              role="menuitem"
            >
              <span className="w-4 h-4 mr-2">🗑️</span>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
