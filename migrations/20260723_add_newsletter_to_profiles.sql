-- Migration: Add newsletter_subscribed column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT false;
