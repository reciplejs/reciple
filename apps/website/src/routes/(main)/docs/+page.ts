import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export async function load(data) {
    // TODO: Automatically redirect to the latest version
    redirect(302, resolve('/(main)/docs/[package]/[tag]/[...slug]', {
        package: 'reciple',
        tag: 'latest',
        slug: ''
    }));
}
