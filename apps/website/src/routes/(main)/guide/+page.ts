import { resolve } from '$app/paths';
import type { MarkdownModules } from '$lib/helpers/types';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export async function load(data) {
    const modules = import.meta.glob(`$lib/guide/*/*.md`) as MarkdownModules;
    const first = Object.entries(modules)[0];

    if (!first) error(404, 'Not found');

    const path = first[0].split('/');
    const page = path.pop()?.split('-').pop()?.replace('.md', '');
    const category = path.pop()?.split('-').pop();

    redirect(302, resolve('/(main)/guide/[...slug]', {
        slug: `${category}/${page}`
    }));
}
