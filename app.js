/* ============================================================
   BuiltSELL — shared data layer
   Used by both index.html (renders content) and admin.html (edits it).
   Data is stored in localStorage as JSON. Use Export/Import in the
   admin panel to move content between browsers or bake it into the site.
   ============================================================ */

const STORE_KEY = 'builtsell_data_v1';

/* ---- Default content (used on first load / after reset) ---- */
const DEFAULTS = {
  brand: {
    name: 'Built',
    accentWord: 'SELL',
    logoText: 'BS',
    tagline: "We build websites, mobile apps & custom software that sell. From idea to launch — done right."
  },
  pills: ['Web Development', 'App Development', 'UI / UX', 'Custom Software'],
  links: [
    { id: 'l1', title: 'Start a Project', sub: 'Free quote in 24 hours', url: '#', icon: 'bolt',     primary: true },
    { id: 'l2', title: 'Our Work',        sub: "Apps & sites we've shipped", url: '#portfolio', icon: 'gallery', primary: false },
    { id: 'l3', title: 'Services & Pricing', sub: 'What we build and how it works', url: '#', icon: 'gear', primary: false },
    { id: 'l4', title: 'Book a Free Call', sub: '15 min discovery call', url: '#', icon: 'calendar', primary: false },
    { id: 'l5', title: 'WhatsApp Us', sub: 'Chat with the team', url: 'https://wa.me/0000000000', icon: 'chat', primary: false }
  ],
  projects: [
    { id: 'p1', title: 'Retail POS App', category: 'Mobile App', description: 'Cross-platform point-of-sale app with offline sync.', image: '', url: '#' },
    { id: 'p2', title: 'SaaS Dashboard', category: 'Web App', description: 'Analytics dashboard with real-time charts and auth.', image: '', url: '#' },
    { id: 'p3', title: 'Restaurant Site', category: 'Website', description: 'Fast marketing site with online ordering.', image: '', url: '#' }
  ],
  socials: {
    instagram: '#',
    x: '#',
    linkedin: '#',
    email: 'hello@builtsell.com',
    whatsapp: 'https://wa.me/0000000000'
  }
};

/* ---- Storage helpers ---- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    // shallow-merge so new default keys appear after updates
    return Object.assign(structuredClone(DEFAULTS), parsed);
  } catch (e) {
    console.warn('Failed to load data, using defaults', e);
    return structuredClone(DEFAULTS);
  }
}

function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function resetData() {
  localStorage.removeItem(STORE_KEY);
}

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

/* ---- Named SVG icons for link buttons ---- */
const ICONS = {
  bolt:     '<path d="M13 2 3 14h7l-1 8 11-12h-7z"/>',
  gallery:  '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8"/>',
  gear:     '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/><circle cx="12" cy="12" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chat:     '<path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z"/>',
  link:     '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  globe:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  rocket:   '<path d="M5 15c-2 1-3 5-3 5s4-1 5-3M9 19l-4-4a13 13 0 0 1 9-9c4 0 5 1 5 1s1 1 1 5a13 13 0 0 1-9 9z"/><circle cx="14.5" cy="9.5" r="1.5"/>',
  star:     '<path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.5L6 21l1.5-7L2 9.5 9 9z"/>',
  cart:     '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.5 12h11l2-8H6"/>'
};

const ICON_KEYS = Object.keys(ICONS);

function iconSvg(key) {
  const path = ICONS[key] || ICONS.link;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/* ============================================================
   Supabase layer
   Requires supabase-config.js + the supabase-js CDN script to be
   loaded BEFORE this file. Falls back to localStorage if Supabase
   is not configured or unreachable.
   ============================================================ */

function supabaseConfigured() {
  return typeof window !== 'undefined'
    && window.SUPABASE_URL && !/YOUR-PROJECT/.test(window.SUPABASE_URL)
    && window.SUPABASE_ANON_KEY && !/YOUR-ANON/.test(window.SUPABASE_ANON_KEY)
    && window.supabase;
}

let _sbClient = null;
function sb() {
  if (!supabaseConfigured()) return null;
  if (!_sbClient) {
    _sbClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
  return _sbClient;
}

const CONTENT_ID = () => (typeof window !== 'undefined' && window.SUPABASE_CONTENT_ID) || 1;

/* Read content from Supabase; returns merged-with-defaults object,
   or null if not configured / row empty / on error. */
async function fetchRemote() {
  const client = sb();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('site_content')
      .select('data')
      .eq('id', CONTENT_ID())
      .single();
    if (error) { console.warn('Supabase fetch error', error.message); return null; }
    if (!data || !data.data || !Object.keys(data.data).length) return null;
    return Object.assign(structuredClone(DEFAULTS), data.data);
  } catch (e) {
    console.warn('Supabase fetch failed', e);
    return null;
  }
}

/* Write content to Supabase (requires an authenticated admin session). */
async function pushRemote(content) {
  const client = sb();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client
    .from('site_content')
    .upsert({ id: CONTENT_ID(), data: content }, { onConflict: 'id' });
  if (error) throw error;
  return true;
}

/* Convenience: best source of truth for the public page.
   Tries Supabase first, falls back to local/defaults. */
async function loadContent() {
  const remote = await fetchRemote();
  if (remote) return remote;
  return loadData();
}
