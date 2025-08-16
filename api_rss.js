// Vercel Serverless Function to fetch your Buzzsprout RSS server-side
// Path: /api/rss.js  (keep the folder name exactly 'api')

export default async function handler(req, res) {
  // --- CORS for local testing & cross-origin usage (optional) ---
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  // (A) Simplest & safest: hardcode your RSS feed (prevents open proxy abuse)
  const FEED_URL = 'https://feeds.buzzsprout.com/2392678.rss';

  // (B) If you prefer to pass a URL param, uncomment next line and use req.query.url
  // const FEED_URL = typeof req.query.url === 'string' ? req.query.url : 'https://feeds.buzzsprout.com/2392678.rss';

  try {
    const upstream = await fetch(FEED_URL, {
      // Some hosts can be picky about User-Agent
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VercelServerless/1.0)' },
      // You can add a timeout controller if desired
    });

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error ${upstream.status}`);
      return;
    }

    const text = await upstream.text();

    // CORS + Content-Type
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');

    // Optional: very light cache control (clients & Vercel edge)
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');

    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('Error fetching feed');
  }
}
