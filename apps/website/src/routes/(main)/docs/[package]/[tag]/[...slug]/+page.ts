import { error, redirect } from '@sveltejs/kit';
import { DocType, type SidebarData } from '$lib/helpers/types.js';
import { resolve } from '$app/paths';
import { DocTypeIcons } from '$lib/helpers/constants.js';

export async function load(data) {
    const pkg = data.params.package;
    const tag = data.params.tag;
    const [type, name] = data.params.slug.split('/');

    if (!type !== !name) error(404, 'Not found');
    if (!type && !name) {
        redirect(302, resolve('/(main)/docs/[package]/[tag]/[...slug]', {
            package: pkg,
            tag,
            slug: 'home/readme'
        }));
    }

    return {
        package: pkg,
        tag,
        type: type || null,
        name: name || null,
        sidebarData: {
            header: {
                title: pkg
            },
            content: {
                groups: [
                    {
                        categories: {
                            Home: {
                                icon: DocTypeIcons[DocType.Home],
                                links: [
                                    {
                                        label: 'Readme',
                                        href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                            package: pkg,
                                            tag,
                                            slug: 'home/readme'
                                        })
                                    }
                                ]
                            },
                            Classes: {
                                icon: DocTypeIcons[DocType.Class],
                                links: []
                            },
                            Namespaces: {
                                icon: DocTypeIcons[DocType.Namespace],
                                links: []
                            },
                            Functions: {
                                icon: DocTypeIcons[DocType.Function],
                                links: []
                            },
                            Variables: {
                                icon: DocTypeIcons[DocType.Variable],
                                links: []
                            },
                            Enums: {
                                icon: DocTypeIcons[DocType.Enum],
                                links: []
                            },
                            Interfaces: {
                                icon: DocTypeIcons[DocType.Interface],
                                links: []
                            },
                            Types: {
                                icon: DocTypeIcons[DocType.Type],
                                links: []
                            }
                        }
                    }
                ]
            }
        } satisfies SidebarData
    };
}
