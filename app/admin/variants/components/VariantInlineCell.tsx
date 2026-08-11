"use client";

import React, { useState, useRef, useEffect, memo } from 'react';

interface VariantInlineCellProps {
  type: 'number' | 'boolean';
  value: number | boolean | null;
  onSave: (val: any) => Promise<void>;
  min?: number;
}

export default memo(function VariantInlineCell({ type, value, onSave, min = 0 }: VariantInlineCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<any>(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = async () => {
    if (currentValue === value || currentValue === "") {
      setCurrentValue(value); // reset if empty or unchanged
      setIsEditing(false);
      return;
    }
    
    if (type === 'number') {
      const num = Number(currentValue);
      if (isNaN(num) || num < min) {
        alert(`Value must be a valid number >= ${min}`);
        setCurrentValue(value);
        setIsEditing(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSave(type === 'number' ? Number(currentValue) : currentValue);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save inline edit.");
      setCurrentValue(value); // revert
      if (inputRef.current) inputRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value); // reset
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div 
        className={`px-3 py-2 cursor-pointer rounded border border-transparent hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center min-h-[40px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDoubleClick={() => setIsEditing(true)}
        title="Double click to edit"
      >
        {type === 'boolean' ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {value ? "Active" : "Inactive"}
          </span>
        ) : (
          <span className="font-medium text-gray-900">{value === null ? "—" : value}</span>
        )}
      </div>
    );
  }

  return (
    <div className="px-1 py-1 min-h-[40px] flex items-center" onBlur={(e) => {
      // Don't save if blur is moving to a child of this div (though unlikely for input/select)
      if (!e.currentTarget.contains(e.relatedTarget)) {
        handleSave();
      }
    }}>
      {type === 'boolean' ? (
        <select
          ref={inputRef as any}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
          value={currentValue ? "true" : "false"}
          onChange={(e) => setCurrentValue(e.target.value === "true")}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      ) : (
        <input
          ref={inputRef as any}
          type="number"
          min={min}
          step="any"
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
          value={currentValue === null ? "" : currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      )}
    </div>
  );
});
