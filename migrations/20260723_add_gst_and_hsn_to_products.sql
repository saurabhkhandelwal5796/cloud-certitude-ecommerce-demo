-- Migration: Add gst_rate and hsn_code columns to products table
ALTER TABLE products 
ADD COLUMN gst_rate NUMERIC DEFAULT 5,
ADD COLUMN hsn_code TEXT NULL;
