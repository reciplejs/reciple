import { Documentation } from '$lib/helpers/classes/Documentation.svelte';
import { error } from '@sveltejs/kit';

export async function load(data) {
    const pkg = (await Documentation.fetchPackages()).includes(data.params.package) ? data.params.package : null;
    if (!pkg) throw error(404, 'Not found');

    const tags = await Documentation.fetchTags(pkg);

    // if (tags.length === 1) {
    //     redirect(302, resolve('/(main)/docs/[package]/[tag]', {
    //         package: pkg,
    //         tag: tags[0]
    //     }));
    // }

    return {
        package: pkg,
        tags
    };
}
