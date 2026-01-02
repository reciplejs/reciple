import type { MarkdownModules } from '$lib/helpers/types.js';
import { error } from '@sveltejs/kit';

export async function load(data) {
    const parts = data.params.slug.split('/');
    const pageId = parts.pop();
    const categoryId = parts.pop();

    const modules = import.meta.glob(`$lib/guide/*/*.md`) as MarkdownModules;
    const markdown = Object
        .entries(modules)
        .find(([path, current]) => {
            const parts = path.split('/');
            const page = parts.pop()?.split('-').pop()?.replace('.md', '');
            const category = parts.pop()?.split('-').pop();

            return category === categoryId && page === pageId;
        });

    if (!markdown) error(404, 'Not found');

    const { default: component, metadata } = await markdown[1]();

    return {
        component,
        metadata,
        modules
    };
}
