<script lang="ts">
    import '$lib/styles/markdown.css';
    import { compile, escapeSvelte } from 'mdsvex';
    import { type HTMLAttributes } from 'svelte/elements';
    import { highlighter, themes } from '$lib/helpers/utils';
    import rehypeSlug from 'rehype-slug';
    import rehypeExternalLinks from 'rehype-external-links';
    import rehypeAutolinkHeadings from 'rehype-autolink-headings';

    let {
        content,
        ...props
    }: {
        content: string;
    } & HTMLAttributes<HTMLElement> = $props();

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
        }
    }));
</script>

<article
    {...props}
    class={[
        "prose prose-neutral prose-sm @3xl:prose-base dark:prose-invert max-w-none p-4",
        "prose-code:after:content-none prose-code:before:content-none prose-code:bg-foreground/15 prose-code:py-0.5 prose-code:px-1 prose-code:rounded-md",
        "prose-pre:prose-code:rounded-none prose-pre:prose-code:p-0 prose-pre:prose-code:bg-transparent prose-pre:leading-tight",
        "prose-blockquote:prose-p:before:content-none prose-blockquote:prose-p:after:content-none",
        "prose-a:text-primary dark:prose-a:text-blue-400 prose-a:no-underline",
        props.class
    ]}
>
    {#await markdown then data}
        {@html data!.code}
    {/await}
</article>
