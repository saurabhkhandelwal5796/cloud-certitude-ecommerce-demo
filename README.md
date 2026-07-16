# Cloud Certitude E-Commerce Demo

A production-ready, full-stack e-commerce platform for a clothing store — built on **Next.js 15** (App Router), **Supabase**, and deployed on **Vercel**.

---

## Overview

Cloud Certitude E-Commerce Demo is a modern, scalable e-commerce foundation designed for a clothing retail store. It combines the power of the Next.js App Router with Supabase's real-time database and authentication capabilities, all deployed seamlessly on Vercel.

This repository is currently at **Phase 1 — Project Foundation**. The folder structure, configuration, and technology integrations are in place, ready for feature development.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | Supabase Auth *(coming soon)* |
| **Storage** | Supabase Storage *(coming soon)* |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Repository** | [GitHub](https://github.com/) |

---

## Project Structure

```
cloud-certitude-ecommerce-demo/
├── app/                    # Next.js App Router pages & layouts
│   ├── layout.tsx          # Root layout with metadata & fonts
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global CSS
├── components/             # Reusable React components
│   ├── ui/                 # Primitive UI components (Button, Input, Card…)
│   └── layout/             # Layout components (Header, Footer, Nav…)
├── lib/
│   └── supabase/           # Supabase client configuration
│       ├── client.ts       # Browser-side client
│       ├── server.ts       # Server-side admin client
│       └── index.ts        # Central re-export
├── services/               # Business logic / data-fetching services
├── hooks/                  # Custom React hooks
├── utils/                  # Shared utility functions
├── types/                  # Global TypeScript types & interfaces
├── public/
│   ├── images/             # Static images
│   └── icons/              # Static icons & SVGs
├── styles/                 # Additional global / component CSS
├── .env.example            # Environment variable template
├── vercel.json             # Vercel deployment configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
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

Open `.env.local` and set the following values (find them in your [Supabase Dashboard](https://supabase.com/dashboard) → Project → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Never commit `.env.local` to version control.** It is gitignored by default.

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
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files |

---

## Deployment (Vercel)

1. Push your code to GitHub.
2. Import the repository in your [Vercel Dashboard](https://vercel.com/new).
3. Add the environment variables in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**.

---

## Roadmap

| Phase | Feature | Status |
|---|---|---|
| **1** | Project foundation & folder structure | ✅ Complete |
| **2** | Authentication (Supabase Auth + session management) | 🔜 Planned |
| **3** | Product catalogue (listing, detail pages, categories) | 🔜 Planned |
| **4** | Shopping cart (add/remove, quantity, persistence) | 🔜 Planned |
| **5** | Checkout & payment gateway integration | 🔜 Planned |
| **6** | Order management & history | 🔜 Planned |
| **7** | Admin dashboard (products, orders, users) | 🔜 Planned |
| **8** | Supabase Storage (product images upload) | 🔜 Planned |
| **9** | Search, filters & sorting | 🔜 Planned |
| **10** | Performance optimisation & PWA support | 🔜 Planned |

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

[MIT](LICENSE)
