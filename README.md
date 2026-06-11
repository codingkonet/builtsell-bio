# BuiltSELL — Link-in-Bio & Admin

A fast, dependency-free link-in-bio landing page for **BuiltSELL** (web & app development), with a built-in admin panel backed by Supabase.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Public landing page — renders brand, link buttons, portfolio & socials from Supabase |
| `admin.html` | Password-protected admin panel (Supabase Auth) to edit content and publish |
| `app.js` | Shared data layer: defaults, icons, and Supabase read/write helpers |
| `supabase-config.js` | Project URL + publishable key (safe to be public) |
| `supabase-setup.sql` | One-time schema + Row Level Security policies |

## How it works

- Content lives in a single `site_content` row (JSON) in Supabase.
- **Public read** is open so visitors load the page; **writes require an authenticated admin** (enforced by RLS).
- Admins sign in with email/password, edit, and click **Save & publish** — changes go live for everyone instantly.
- If Supabase isn't configured, everything falls back to `localStorage` (offline mode).

## Setup

1. Create a Supabase project and put its URL + publishable key in `supabase-config.js`.
2. Run `supabase-setup.sql` in the Supabase SQL Editor.
3. Create an admin user in **Authentication → Users**.
4. Open `admin.html`, sign in, and publish.

## Deploy

Static hosting only (Netlify, Vercel, GitHub Pages, etc.) — just serve the folder. The pages talk directly to Supabase.
