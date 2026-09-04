# MSR TECH SEO SEARCHER

Complete SEO analysis dashboard with a static frontend and secure server-side Google API functions.

## User experience
Users enter only a website URL. There is **no API-key field** in the UI.

## Features
- Google PageSpeed Insights / Lighthouse audit
- Performance, accessibility, best-practices and SEO scores
- Core Web Vitals and Lighthouse metrics
- Technical/on-page SEO signals
- Keyword improvement ideas
- Competitor discovery through Google Custom Search
- Backlink **prospect** discovery (not fabricated backlink counts)
- Organic traffic recommendations
- Copyable complete SEO implementation prompt
- Responsive UI

## Secure backend
The `api/` directory contains serverless functions for Vercel-compatible deployment:
- `/api/audit` — Google PageSpeed Insights
- `/api/search` — Google Custom Search for competitors and backlink prospects

Secrets are loaded from server environment variables. Never put real API keys in `index.html`, `config.js`, or GitHub.

### Environment variables
Copy `.env.example` and configure these on the backend host:

- `GOOGLE_PAGESPEED_API_KEY`
- `GOOGLE_SEARCH_API_KEY` (can use a separate restricted key)
- `GOOGLE_CSE_ID`

The Google project must have the required APIs enabled and the keys should be restricted to only the APIs and applications that need them.

## Deploying the backend
Deploy this repository to a serverless host that supports the `api/` directory, such as Vercel. Add the environment variables in the host's project settings. Do not commit `.env` files.

When the frontend and backend are deployed together, the frontend automatically calls `/api/audit` and `/api/search`.

If the frontend remains on GitHub Pages, configure `window.MSR_API_BASE` in a small static configuration file to point to your deployed backend, and enable CORS on that backend for the GitHub Pages origin.

## GitHub Pages
The current repository is `nak`. GitHub Pages can serve the frontend, but it does **not** execute the `api/` serverless functions. For a single-domain full-stack deployment, use a serverless host for this repository. For a GitHub Pages frontend plus separate backend, configure the backend URL as described above.

## Security note
The Google API key previously pasted into chat should be revoked/rotated before production use. Store the replacement only as a server-side secret and apply Google API/application restrictions.
