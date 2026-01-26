import { error, redirect } from '@sveltejs/kit';
import { DocType, type SidebarData } from '$lib/helpers/types.js';
import { resolve } from '$app/paths';
import { DocTypeIcons } from '$lib/helpers/constants.js';
import { Documentation } from '$lib/helpers/classes/Documentation.svelte.js';
import type { DocNodeKind } from '@deno/doc';
import { PackageIcon, TagIcon } from '@lucide/svelte';
import { definePageMetaTags } from 'svelte-meta-tags';
import { markdownToTxt } from 'markdown-to-txt';

export async function load(data) {
    const pkg = data.params.package;
    const tag = data.params.tag;
    const [type, name] = data.params.slug.split('/') as [DocNodeKind|'home'|undefined, string|undefined];

    if (!type !== !name) error(404, 'Not found');
    if (!type && !name) {
        redirect(302, resolve('/(main)/docs/[package]/[tag]/[...slug]', {
            package: pkg,
            tag,
            slug: 'home/readme'
        }));
    }

    const documentation =  await new Documentation({
        package: pkg,
        tag
    }).fetch(data.fetch).catch(() => null);

    const nodes = documentation?.data.filter(n => n.kind === type && n.name === name);

    if (!documentation || !nodes?.length && type !== 'home') error(404, 'Not found');

    const title = nodes?.length ? nodes[0].name : `${pkg}@${tag}`;
    const description = markdownToTxt((nodes?.length ? nodes[0].jsDoc?.doc : documentation?.readme) || '');

    return {
        package: pkg,
        tag,
        type: type || null,
        name: name || null,
        documentation,
        nodes,
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title,
                description
            },
            twitter: {
                title,
                description
            }
        }),
        metadata: { title },
        sidebarData: {
            header: {
                title: `${pkg}@${tag}`,
                menus: [
                    {
                        label: 'Packages',
                        active: pkg,
                        icon: PackageIcon,
                        items: Documentation.packages.map(pkg => ({
                            name: pkg,
                            icon: PackageIcon,
                            href: resolve('/(main)/docs/[package]', {
                                package: pkg
                            })
                        }))
                    },
                    {
                        label: 'Tags',
                        active: tag,
                        icon: TagIcon,
                        items: (await Documentation.fetchTags(pkg)).map(tag => ({
                            name: tag,
                            icon: TagIcon,
                            href: resolve('/(main)/docs/[package]/[tag]', {
                                package: pkg,
                                tag
                            })
                        }))
                    }
                ]
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
                                            slug: `${DocType.Home}/readme`
                                        })
                                    }
                                ]
                            },
                            Classes: {
                                icon: DocTypeIcons[DocType.Class],
                                links: documentation.classes.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            },
                            Namespaces: {
                                icon: DocTypeIcons[DocType.Namespace],
                                links: documentation.namespaces.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            },
                            Functions: {
                                icon: DocTypeIcons[DocType.Function],
                                links: documentation.functions.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            },
                            Variables: {
                                icon: DocTypeIcons[DocType.Variable],
                                links: documentation.variables.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            },
                            Enums: {
                                icon: DocTypeIcons[DocType.Enum],
                                links: documentation.enums.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            },
                            Interfaces: {
                                icon: DocTypeIcons[DocType.Interface],
                                links: documentation.interfaces.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            },
                            Types: {
                                icon: DocTypeIcons[DocType.TypeAlias],
                                links: documentation.types.map(n => ({
                                    label: n.name,
                                    deprecated: !!documentation.getJsdocTag(n, 'deprecated'),
                                    href: documentation.resolveNodeLink(n)
                                }))
                            }
                        }
                    }
                ]
            }
        } satisfies SidebarData
    };
}
