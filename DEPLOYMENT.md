# Deployment Guide: Vercel & Supabase

This guide provides instructions to deploy the Cloud Certitude Fashion e-commerce application to Vercel, integrated with Supabase for data persistence.

---

## 1. Prerequisites
- A **GitHub / GitLab / Bitbucket** account.
- A **Vercel** account (linked to your git provider).
- A **Supabase** account with an active project.

---

## 2. Environment Variables Configuration

You must add the following environment variables in Vercel under **Project Settings → Environment Variables**:

| Variable Name | Type | Description / Value Location |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client/Server) | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client/Server) | Supabase Dashboard → Settings → API → `anon` (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (Server Only) | Supabase Dashboard → Settings → API → `service_role` key |

> [!WARNING]
> Keep `SUPABASE_SERVICE_ROLE_KEY` strictly secret. Do NOT prefix it with `NEXT_PUBLIC_` to prevent it from leaking into the client-side JavaScript bundle.

---

## 3. Vercel Deployment Steps

### Step 1: Import Project
1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import the repository `saurabhkhandelwal5796/cloud-certitude-ecommerce-demo`.

### Step 2: Build & Development Settings
Leave these at their defaults:
- **Framework Preset:** `Next.js`
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** Default (`.next`)

### Step 3: Add Environment Variables
Add the three keys documented in section 2 above.

### Step 4: Deploy
Click **Deploy**. Vercel will build the application, execute TypeScript compiling, run Next.js static generation, and deploy edge functions.

---

## 4. Supabase Schema Requirements

To ensure all functions (orders tracking, analytics, and reviews) persist, execute the following SQL scripts in your Supabase SQL Editor:

### Reviews Table Setup
```sql
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    review_text TEXT NOT NULL,
    helpful_votes INTEGER DEFAULT 0,
    reported BOOLEAN DEFAULT false,
    verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and set public select, insert
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow anonymous/authenticated insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update reviews helpful count" ON public.reviews FOR UPDATE USING (true);
```

### Orders Table Setup
```sql
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL,
    payment_method TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and set public policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update orders" ON public.orders FOR UPDATE USING (true);
```

---

## 5. Troubleshooting Guide

### Issue: Dev / Build Route Caching Mismatch
- **Symptoms:** Linter or build fails on `.next/dev/types/validator.ts` referencing missing paths or type conversions.
- **Solution:** Clear Next.js cache locally (`rm -rf .next`) and rebuild. Vercel automatically does a clean build without cache when executing deployments.

### Issue: Hydration Failures
- **Symptoms:** React console warning "Text content did not match..."
- **Solution:** Ensure time-dependent mock elements (e.g. countdown timer banners) are wrapped in `useEffect` state hooks so they only execute after mounting on the client side.

### Issue: Supabase Config Status Error
- **Symptoms:** Storefront logs "Supabase connection is not configured."
- **Solution:** Verify that your environment variables match exactly and contain no whitespace or trailing slashes.
