export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const input = req.method === 'GET' ? req.query : (req.body || {});
  const url = String(input.url || '').trim();
  const strategy = input.strategy === 'desktop' ? 'desktop' : 'mobile';
  const key = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server is not configured.' });
  try { new URL(url); } catch { return res.status(400).json({ error: 'Enter a valid public website URL.' }); }
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('key', key);
  endpoint.searchParams.set('strategy', strategy);
  for (const category of ['performance','accessibility','best-practices','seo']) endpoint.searchParams.append('category', category);
  const response = await fetch(endpoint);
  const data = await response.json();
  if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Google PageSpeed request failed.' });
  const categories = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};
  const score = name => categories[name]?.score == null ? null : Math.round(categories[name].score * 100);
  const pick = id => { const a = audits[id]; return a ? { title:a.title, description:a.description, score:a.score, displayValue:a.displayValue, numericValue:a.numericValue } : null; };
  return res.status(200).json({ ok:true, url, strategy, finalUrl:data.lighthouseResult?.finalUrl || url, scores:{ performance:score('performance'), accessibility:score('accessibility'), bestPractices:score('best-practices'), seo:score('seo') }, metrics:{ fcp:pick('first-contentful-paint'), lcp:pick('largest-contentful-paint'), cls:pick('cumulative-layout-shift'), inp:pick('interaction-to-next-paint'), tbt:pick('total-blocking-time'), speedIndex:pick('speed-index') }, seoAudits:{ title:pick('document-title'), metaDescription:pick('meta-description'), viewport:pick('viewport'), canonical:pick('canonical'), robotsTxt:pick('robots-txt'), crawlable:pick('is-crawlable'), headings:pick('heading-order'), imageAlt:pick('image-alt'), linkText:pick('link-text') }, failedAudits:Object.entries(audits).filter(([,a]) => a && a.scoreDisplayMode === 'binary' && a.score !== 1 && a.score !== null).slice(0,40).map(([id,a]) => ({ id, title:a.title, description:a.description, displayValue:a.displayValue, score:a.score })) });
}
