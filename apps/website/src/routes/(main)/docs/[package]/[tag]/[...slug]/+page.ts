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

    const declarations = Object.entries(
        documentation?.getDeclarations(type as DocNodeKind) ?? {}
    ).find(([n]) => n === name)?.[1];

    if (!documentation || !declarations?.length && type !== 'home') error(404, 'Not found');

    const title = declarations?.length ? `${pkg}@${tag} | ${declarations[0].declaration.kind} ${declarations[0].symbol.name}` : `${pkg}@${tag}`;
    const description = markdownToTxt((declarations?.length ? declarations[0].declaration.jsDoc?.doc : documentation?.readme) || '');

    return {
        package: pkg,
        tag,
        type: type || null,
        name: name || null,
        documentation,
        declarations,
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
        metadata: {
            title: declarations?.length ? declarations[0].symbol.name : `${pkg}@${tag}`
        },
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
                                links: getDeclarationSidebarLinks(documentation, 'class')
                            },
                            Namespaces: {
                                icon: DocTypeIcons[DocType.Namespace],
                                links: getDeclarationSidebarLinks(documentation, 'namespace')
                            },
                            Functions: {
                                icon: DocTypeIcons[DocType.Function],
                                links: getDeclarationSidebarLinks(documentation, 'function')
                            },
                            Variables: {
                                icon: DocTypeIcons[DocType.Variable],
                                links: getDeclarationSidebarLinks(documentation, 'variable')
                            },
                            Enums: {
                                icon: DocTypeIcons[DocType.Enum],
                                links: getDeclarationSidebarLinks(documentation, 'enum')
                            },
                            Interfaces: {
                                icon: DocTypeIcons[DocType.Interface],
                                links: getDeclarationSidebarLinks(documentation, 'interface')
                            },
                            Types: {
                                icon: DocTypeIcons[DocType.TypeAlias],
                                links: getDeclarationSidebarLinks(documentation, 'typeAlias')
                            }
                        }
                    }
                ]
            }
        } satisfies SidebarData
    };
}

function getDeclarationSidebarLinks(documentation: Documentation, kind: DocNodeKind) {
    return Object.entries(documentation.getDeclarations(kind))
        .map(([name, data]) => data
            .map(({ symbol, declaration }) => ({
                label: symbol.name,
                deprecated: !!documentation.getJsdocTag(declaration, 'deprecated'),
                href: documentation.getDeclarationPath(name, declaration)
            }))
        ).flat();
}
