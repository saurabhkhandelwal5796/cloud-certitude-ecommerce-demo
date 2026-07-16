"use client";

import React from "react";

export interface AddressType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface ShippingFormProps {
  address: AddressType;
  setAddress: React.Dispatch<React.SetStateAction<AddressType>>;
  errors: Partial<Record<keyof AddressType, string>>;
}

/**
 * ShippingForm Component
 *
 * Captures customer address details for e-commerce shipment.
 * Displays field inputs and validation warnings.
 */
export default function ShippingForm({ address, setAddress, errors }: ShippingFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => {
      const updated = { ...prev, [name]: value };
      // Save to localStorage immediately on change
      localStorage.setItem("certitude_shipping_address", JSON.stringify(updated));
      return updated;
    });
  };

  const inputClass = (field: keyof AddressType) =>
    `block w-full rounded-md border ${
      errors[field] ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-stone-200 focus:border-[#E0A99E] focus:ring-[#E0A99E]"
    } bg-white px-3 py-2 text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-1 sm:text-xs`;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-105 pb-3 text-left">
        Shipping Address
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={address.firstName}
            onChange={handleChange}
            placeholder="e.g. John"
            className={inputClass("firstName")}
          />
          {errors.firstName && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.firstName}</span>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={address.lastName}
            onChange={handleChange}
            placeholder="e.g. Doe"
            className={inputClass("lastName")}
          />
          {errors.lastName && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.lastName}</span>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={address.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass("email")}
          />
          {errors.email && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={address.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className={inputClass("phone")}
          />
          {errors.phone && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.phone}</span>}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label htmlFor="addressLine1" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Address Line 1 <span className="text-rose-500">*</span>
          </label>
          <input
            id="addressLine1"
            type="text"
            name="addressLine1"
            value={address.addressLine1}
            onChange={handleChange}
            placeholder="Street address, P.O. Box"
            className={inputClass("addressLine1")}
          />
          {errors.addressLine1 && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.addressLine1}</span>}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label htmlFor="addressLine2" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            id="addressLine2"
            type="text"
            name="addressLine2"
            value={address.addressLine2}
            onChange={handleChange}
            placeholder="Apartment, suite, unit, building"
            className={inputClass("addressLine2")}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            name="city"
            value={address.city}
            onChange={handleChange}
            placeholder="e.g. New York"
            className={inputClass("city")}
          />
          {errors.city && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.city}</span>}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            State / Region <span className="text-rose-500">*</span>
          </label>
          <input
            id="state"
            type="text"
            name="state"
            value={address.state}
            onChange={handleChange}
            placeholder="e.g. NY"
            className={inputClass("state")}
          />
          {errors.state && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.state}</span>}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Country <span className="text-rose-500">*</span>
          </label>
          <input
            id="country"
            type="text"
            name="country"
            value={address.country}
            onChange={handleChange}
            placeholder="e.g. United States"
            className={inputClass("country")}
          />
          {errors.country && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.country}</span>}
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Postal Code / Zip <span className="text-rose-500">*</span>
          </label>
          <input
            id="postalCode"
            type="text"
            name="postalCode"
            value={address.postalCode}
            onChange={handleChange}
            placeholder="e.g. 10001"
            className={inputClass("postalCode")}
          />
          {errors.postalCode && <span className="text-[10px] text-rose-500 font-medium mt-1 block">{errors.postalCode}</span>}
        </div>
      </div>
    </div>
  );
}
