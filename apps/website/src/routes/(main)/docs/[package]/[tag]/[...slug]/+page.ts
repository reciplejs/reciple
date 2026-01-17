import { error, redirect } from '@sveltejs/kit';
import { DocType, type MarkdownMetadata, type SidebarData } from '$lib/helpers/types.js';
import { resolve } from '$app/paths';
import { DocTypeIcons } from '$lib/helpers/constants.js';
import { Documentation } from '../../../../../../lib/helpers/classes/Documentation.svelte.js';
import { markdownToTxt } from 'markdown-to-txt';
import type { DocNodeKind } from '@deno/doc';

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
    }).fetch(data.fetch);

    const node = documentation.data.find(n => n.kind === type && n.name === name);

    if (!node && type !== 'home') error(404, 'Not found');

    const metadata: MarkdownMetadata = {
        title: node ? node.name : `${pkg}@${tag}`,
        description: markdownToTxt(documentation.readme)
    };

    return {
        package: pkg,
        tag,
        type: type || null,
        name: name || null,
        documentation,
        metadata,
        sidebarData: {
            header: {
                title: `${pkg}@${tag}`
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
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.Class}/${n.name}`
                                    })
                                }))
                            },
                            Namespaces: {
                                icon: DocTypeIcons[DocType.Namespace],
                                links: documentation.namespaces.map(n => ({
                                    label: n.name,
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.Namespace}/${n.name}`
                                    })
                                }))
                            },
                            Functions: {
                                icon: DocTypeIcons[DocType.Function],
                                links: documentation.functions.map(n => ({
                                    label: n.name,
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.Function}/${n.name}`
                                    })
                                }))
                            },
                            Variables: {
                                icon: DocTypeIcons[DocType.Variable],
                                links: documentation.variables.map(n => ({
                                    label: n.name,
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.Variable}/${n.name}`
                                    })
                                }))
                            },
                            Enums: {
                                icon: DocTypeIcons[DocType.Enum],
                                links: documentation.enums.map(n => ({
                                    label: n.name,
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.Enum}/${n.name}`
                                    })
                                }))
                            },
                            Interfaces: {
                                icon: DocTypeIcons[DocType.Interface],
                                links: documentation.interfaces.map(n => ({
                                    label: n.name,
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.Interface}/${n.name}`
                                    })
                                }))
                            },
                            Types: {
                                icon: DocTypeIcons[DocType.TypeAlias],
                                links: documentation.types.map(n => ({
                                    label: n.name,
                                    href: resolve('/(main)/docs/[package]/[tag]/[...slug]', {
                                        package: pkg,
                                        tag,
                                        slug: `${DocType.TypeAlias}/${n.name}`
                                    })
                                }))
                            }
                        }
                    }
                ]
            }
        } satisfies SidebarData
    };
}
