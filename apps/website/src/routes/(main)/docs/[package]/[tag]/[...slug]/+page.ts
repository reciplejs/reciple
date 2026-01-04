import { error, redirect } from '@sveltejs/kit';
import type { SidebarData } from '$lib/helpers/types.js';
import HouseIcon from '@lucide/svelte/icons/house';
import { SymbolClass, SymbolEnum, SymbolInterface, SymbolMethod, SymbolVariable } from 'svelte-codicons';
import { resolve } from '$app/paths';

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
            content: {
                groups: [
                    {
                        label: `${pkg}@${tag}`,
                        categories: {
                            Home: {
                                icon: HouseIcon,
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
                                icon: SymbolClass,
                                links: []
                            },
                            Functions: {
                                icon: SymbolMethod,
                                links: []
                            },
                            Variables: {
                                icon: SymbolVariable,
                                links: []
                            },
                            Enums: {
                                icon: SymbolEnum,
                                links: []
                            },
                            Interfaces: {
                                icon: SymbolInterface,
                                links: []
                            }
                        }
                    }
                ]
            }
        } satisfies SidebarData
    };
}
