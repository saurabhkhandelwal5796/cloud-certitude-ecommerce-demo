# Cloud Certitude E-Commerce Demo

A production-ready, full-stack sustainable e-commerce platform for a luxury clothing storefront — built on **Next.js 16** (App Router), **Supabase**, and deployed on **Vercel**.

---

## Overview

Cloud Certitude Fashion is a premium, scalable, and responsive e-commerce storefront. Designed with modern luxury aesthetics (cream/white glassmorphism), it integrates dynamic features like AI-powered recommendations, date-filtered sales analytics, interactive customer reviews, local checkout simulation, and comprehensive search engine optimization (SEO).

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Glassmorphism |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL client) |
| **Authentication** | Supabase Auth & protected middlewares |
| **Payment Gateway** | Premium simulated payment gateway |
| **Analytics & SEO** | JSON-LD schema schemas, dynamic sitemap, robots, GA/GTM/Pixel tags |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Key Features

1. **Atelier Storefront:** Dynamic categories filters, sorting options, and persistent shopping cart/wishlist context hooks.
2. **AI-Powered Product Recommendations:** Context-based customer preferences matching, frequently bought together bundle deals with automatic 15% discount, complete-the-look packages, and localized regional trends.
3. **Ratings & Reviews System:** Amazon/Shopify-style verified purchase badges, rating distributions, helpful upvotes, reported flag moderation, and reviews sorting filters.
4. **Seller Central Analytics:** Interactive date range area charts, category donuts, orders bar charts, top selling products list, and customer growth trends.
5. **SEO & Metadata Suite:** Standardized JSON-LD schemas, alternates, canonical links, sitemaps, robots configuration, and social share links.
6. **Robust Hardening:** 500 error boundaries, custom 404 pages, skeleton loaders, and protected route middlewares.

---

## Project Structure

```
cloud-certitude-ecommerce-demo/
├── app/                    # Next.js App Router pages & layouts
│   ├── admin/              # Admin analytics, reviews, products, and orders pages
│   ├── cart/               # Shopping bag overview
│   ├── checkout/           # Security checkout forms
│   ├── products/           # Dynamic product details page with recommendations
│   ├── orders/             # Customer order history and timelines
│   ├── robots.ts           # Robots.txt route handler
│   ├── sitemap.ts          # Sitemap.xml route handler
│   ├── error.tsx           # Global 500 error boundaries
│   ├── not-found.tsx       # Global 404 error template
│   └── page.tsx            # Curated homepage
├── components/             # Reusable React components
│   ├── ui/                 # Recommendation cards, reviews, sharing, and banners
│   └── layout/             # Navbar and Footer layouts
├── lib/
│   └── supabase/           # Supabase client configurations
├── services/               # RecommendationService, ReviewService, AdminService, OrderService
├── context/                # CartContext, WishlistContext
├── utils/                  # SEO utilities and formatting helpers
├── DEPLOYMENT.md           # Vercel and Supabase configuration guide
├── package.json            # Configuration and script tasks
└── tsconfig.json           # TypeScript compilation configuration
```

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18.17.0
- **npm** ≥ 9.x
- A **Supabase** account and project ([create one free](https://supabase.com/dashboard))
- A **Vercel** account ([sign up free](https://vercel.com/))

### 1. Clone the repository

```bash
git clone https://github.com/saurabhkhandelwal5796/cloud-certitude-ecommerce-demo.git
cd cloud-certitude-ecommerce-demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Local Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint check |
| `npx tsc --noEmit` | Type-check without emitting files |

---

## Deployment (Vercel)

Please refer to the [DEPLOYMENT.md](file:///c:/Users/skhan/OneDrive/Desktop/clothingIndustry/cloud-certitude-ecommerce-demo/DEPLOYMENT.md) file for a detailed walkthrough on setting up database tables, configuring environment keys, and running deployment cycles.

---

## Roadmap

| Phase | Feature | Status |
|---|---|---|
| **1** | Project foundation & folder structure | ✅ Complete |
| **2** | Authentication (Supabase Auth & session) | ✅ Complete |
| **3** | Product catalogue (listing, detail pages, categories) | ✅ Complete |
| **4** | Shopping cart (add/remove, quantity, persistence) | ✅ Complete |
| **5** | Checkout & payment gateway integration | ✅ Complete |
| **6** | Order management & history | ✅ Complete |
| **7** | Admin dashboard (products, orders, users) | ✅ Complete |
| **8** | AI-powered Recommendations | ✅ Complete |
| **9** | Ratings & Reviews Moderation | ✅ Complete |
| **10** | SEO, Marketing & Production Hardening | ✅ Complete |

---

## License

This project is licensed under the [MIT](LICENSE) License.
