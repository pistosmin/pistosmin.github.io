import type { APIContext } from 'astro';
import { SITE } from '../lib/site';

export function GET({ site }: APIContext) {
  const baseUrl = site ?? SITE.url;

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', baseUrl)}\n`);
}
