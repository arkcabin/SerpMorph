# SerpMorph

<p align="center">
	Turn Google Search Console data into clear SEO actions.
</p>

<p align="center">
	<img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
	<img alt="React" src="https://img.shields.io/badge/React-19-149eca" />
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6" />
	<img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2d3748" />
	<img alt="Database" src="https://img.shields.io/badge/Database-Neon_PostgreSQL-00e699" />
</p>

SerpMorph is a modern SEO analytics app that combines Google Search Console insights with on-page SEO checks in one focused dashboard.

## Why SerpMorph

Search Console gives great data, but it can be hard to translate into action quickly. SerpMorph helps by bringing performance metrics and technical checks together so teams can spot issues, prioritize fixes, and track progress in one place.

## What It Does

- Secure sign in with Google
- Connect and sync Search Console properties
- Select a domain and explore performance data
- Analyze URLs for on-page and technical SEO factors

### Metrics You Can Track

- URLs
- Clicks
- Impressions
- Average ranking position

### SEO Checks Included

- Title tag
- Meta description
- Headings structure
- Sitemap availability
- Robots.txt availability

## Product Flow

1. Sign in with Google
2. Connect Search Console
3. Choose a domain/property
4. Review performance metrics
5. Run SEO analysis on any URL

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS, Shadcn UI |
| Data Fetching | TanStack Query |
| Backend/Data | Prisma ORM, PostgreSQL (Neon) |

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Update .env:

```env
DATABASE_URL="your_postgresql_connection_string"
```

Add Google OAuth and Search Console credentials when authentication and API integration are enabled.

### 3) Initialize Prisma

```bash
npx prisma generate
```

After defining schema models:

```bash
npx prisma migrate dev
```

### 4) Start development server

```bash
npm run dev
```

Open http://localhost:3000

## Roadmap

- [ ] Define production-ready Prisma schema
- [ ] Implement Google OAuth and secure session handling
- [ ] Integrate Search Console API sync
- [ ] Build analytics dashboard views
- [ ] Implement URL SEO analyzer engine
- [ ] Add background sync jobs and alerts

## Current Status

Project foundation is set up and ready for feature implementation:

- Core dependencies installed
- Prisma initialized
- Database connection configured
- Skills and tooling added for rapid development
