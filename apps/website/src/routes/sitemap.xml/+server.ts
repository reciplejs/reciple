import { resolve } from '$app/paths';
import { Documentation } from '../../lib/helpers/classes/Documentation.svelte';
import type { MarkdownModules } from '../../lib/helpers/types';
import { normalizeGuideCategoryId, normalizeGuidePageId } from '../../lib/helpers/utils';

export async function GET({ fetch, url }) {
    const entries: string[] = [];
    const packages = await Documentation.fetchPackages(fetch);

    entries.push(createSitemapEntry(concatURLPath(url.origin, resolve('/')), { priority: '1.0' }));
    entries.push(createSitemapEntry(concatURLPath(url.origin, resolve('/(main)/docs')), { priority: '0.30' }));

    for (const pkg of packages) {
        const tags = await Documentation.fetchTags(pkg, fetch);
        if (!tags.length) continue;

        entries.push(createSitemapEntry(concatURLPath(
            url.origin,
            resolve('/docs/[package]', { package: pkg })), { priority: '0.60' })
        );

        for (const tag of tags) {
            entries.push(createSitemapEntry(concatURLPath(
                url.origin,
                resolve('/(main)/docs/[package]/[tag]', { package: pkg, tag })
            ), { priority: '0.30' }));
        }

        const firstTag = tags[0];
        const documentation = await (new Documentation({ package: pkg, tag: firstTag })).fetch(fetch);

        for (const node of documentation.data) {
            entries.push(createSitemapEntry(concatURLPath(
                url.origin,
                resolve('/(main)/docs/[package]/[tag]/[...slug]', { package: pkg, tag: firstTag, slug: node.name })
            ), { priority: '0.70' }));
        }
    }

    const guides = import.meta.glob(`$lib/guide/*/*{.md,.svx}`) as MarkdownModules;

    for (const [loc, module] of Object.entries(guides)) {
        const { metadata } = await module();
        if (!metadata) continue;

        const parts = loc.split('/');
        const pageId = normalizeGuidePageId(parts.pop() ?? '');
        const categoryId = normalizeGuideCategoryId(parts.pop() ?? '');

        if (!pageId || !categoryId) continue;

        entries.push(createSitemapEntry(concatURLPath(
            url.origin,
            resolve('/(main)/guide/[...slug]', { slug: `${categoryId}/${pageId}` })
        ), { priority: '0.80' }));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${entries.join('')}</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': xml.length.toString(),
            'Cache-Control': 'max-age=3600',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

function createSitemapEntry(url: string, data?: Record<string, string>): string {
    const loc = `<loc>${url}</loc>`;
    const others = Object.entries(data || {}).map(([key, value]) => `<${key}>${value}</${key}>`).join('');
    return `<url>${loc}${others}</url>`;
}

function concatURLPath(origin: string, path: string): string {
    return `${origin}${path.startsWith('/') ? path.startsWith('.') ? path.slice(1) : path : `/${path}`}`;
}
