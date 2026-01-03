import type { MarkdownModules, SidebarData } from '$lib/helpers/types.js';
import { error } from '@sveltejs/kit';
import { normalizeGuideCategoryId, normalizeGuidePageId } from '$lib/helpers/utils.js';
import { resolve } from '$app/paths';
import BoxIcon from '@lucide/svelte/icons/box';

export async function load(data) {
    const parts = data.params.slug.split('/');
    const pageId = parts.pop();
    const categoryId = parts.pop();

    const modules = import.meta.glob(`$lib/guide/*/*{.md,.svx}`) as MarkdownModules;
    const markdown = Object
        .entries(modules)
        .find(([path]) => {
            const parts = path.split('/');
            const page = normalizeGuidePageId(parts.pop() ?? '');
            const category = normalizeGuideCategoryId(parts.pop() ?? '');

            return category === categoryId && page === pageId;
        });

    if (!markdown) error(404, 'Not found');

    const { default: component, metadata } = await markdown[1]();

    return {
        component,
        metadata,
        modules,
        sidebarData: await getSidebarData(modules)
    };
}

async function getSidebarData(modules: MarkdownModules): Promise<SidebarData> {
    const categories: Record<string, SidebarData.GroupCategory> = {};

    for (const [path, module] of Object.entries(modules)) {
        const { metadata } = await module();
        if (!metadata) continue;

        const parts = path.split('/');
        const pageId = normalizeGuidePageId(parts.pop() ?? '');
        const categoryId = normalizeGuideCategoryId(parts.pop() ?? '');

        if (!pageId || !categoryId) continue;

        const category = categories[metadata.category ?? categoryId] ??= {
            links: [],
            icon: BoxIcon,
        };

        category.links.push({
            label: metadata.title ?? pageId,
            metadata,
            href: resolve(`/(main)/guide/[...slug]`, {
                slug: `${categoryId}/${pageId}`
            })
        });
    }

    return {
        content: {
            groups: [
                {
                    categories
                }
            ]
        }
    };
}
