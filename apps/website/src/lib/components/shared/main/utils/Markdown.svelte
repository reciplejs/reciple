<script lang="ts">
    import '$lib/styles/markdown.css';
    import { compile, escapeSvelte, type MdsvexCompileOptions } from 'mdsvex';
    import { highlighter, themes } from '$lib/helpers/utils';
    import rehypeSlug from 'rehype-slug';
    import rehypeExternalLinks from 'rehype-external-links';
    import rehypeAutolinkHeadings from 'rehype-autolink-headings';
    import { type Snippet } from 'svelte';

    let {
        content,
        options,
        children
    }: {
        content: string;
        options?: MdsvexCompileOptions;
        children?: Snippet;
    } = $props();

    let markdown = $derived(compile(content, {
        rehypePlugins: [
            // @ts-expect-error
            rehypeSlug,
            // @ts-expect-error
            [rehypeExternalLinks, { rel: ['nofollow'], target: '_blank' }],
            // @ts-expect-error
            [rehypeAutolinkHeadings, { behavior: 'append' }]
        ],
        highlight: {
            optimise: true,
            highlighter: (code, lang) => {
                const html = escapeSvelte(highlighter.codeToHtml(code, {
                    defaultColor: false,
                    lang: lang ?? 'text',
                    themes
                }));

                return html;
            }
        },
        ...options
    }));
</script>

{#await markdown}
    {@render children?.()}
{:then data}
    {@html data!.code}
{/await}
