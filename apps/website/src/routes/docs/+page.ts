import { resolve } from '$app/paths';
import { error, redirect } from '@sveltejs/kit';
import { Documentation } from '$lib/helpers/classes/Documentation.svelte';

export async function load(data) {
    if (data.url.searchParams.has('no-redirect')) return;

    const pkg = (await Documentation.fetchPackages()).at(0);
    const tag = (await Documentation.fetchTags(pkg!)).at(0);

    if (!pkg || !tag) throw error(404, 'Not found');

    redirect(302, resolve('/(main)/docs/[package]/[tag]', {
        package: pkg,
        tag: tag
    }));
}
