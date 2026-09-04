export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const input = req.method === 'GET' ? req.query : (req.body || {});
  const q = String(input.q || '').trim();
  const domain = String(input.domain || '').trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
  const mode = String(input.mode || 'competitors');
  const key = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return res.status(500).json({ error: 'Search backend is not configured. Set Google API credentials and GOOGLE_CSE_ID on the server.' });
  if (!q) return res.status(400).json({ error: 'Search query is required.' });
  let query = q;
  if (mode === 'backlinks') query = `${q} ("write for us" OR "submit an article" OR "resources" OR "useful links" OR "partners")`;
  if (domain) query += ` -site:${domain}`;
  const endpoint = new URL('https://www.googleapis.com/customsearch/v1');
  endpoint.searchParams.set('key', key); endpoint.searchParams.set('cx', cx); endpoint.searchParams.set('q', query); endpoint.searchParams.set('num', '10');
  const response = await fetch(endpoint); const data = await response.json();
  if (!response.ok) return res.status(response.status).json({ error:data?.error?.message || 'Google Search request failed.' });
  return res.status(200).json({ ok:true, mode, query, totalResults:data.searchInformation?.formattedTotalResults || null, items:(data.items || []).map(x => ({ title:x.title, link:x.link, snippet:x.snippet, displayLink:x.displayLink })) });
}
