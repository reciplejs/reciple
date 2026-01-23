import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import { escapeSvelte, mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';

/**
 * @type {Record<string, import('shiki').BundledTheme>}
 */
const themes = {
    light: 'github-light',
    dark: 'dark-plus'
};

const highlighter = await createHighlighter({
    themes: Object.values(themes),
    langAlias: {
        js: 'javascript',
        ts: 'typescript',
        md: 'markdown',
    },
    langs: [
        "javascript",
        "typescript",
        "svelte",
        "html",
        "markdown",
        "properties",
        "sh",
        "powershell",
        "diff",
        "json",
        "jsonc",
        "yaml",
        "css"
    ]
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
        vitePreprocess(),
        mdsvex({
            extensions: ['.svx', '.md'],
            rehypePlugins: [
                rehypeSlug,
                [rehypeExternalLinks, { rel: ['nofollow'], target: '_blank' }],
                [rehypeAutolinkHeadings, {
                    behavior: 'append'
                }]
            ],
            highlight: {
                highlighter: (code, lang = 'text') => {
                    const html = escapeSvelte(highlighter.codeToHtml(code, {
                        defaultColor: false,
                        lang,
                        themes
                    }));

                    return `{@html \`${html}\`}`;
                }
            }
        })
    ],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},

	extensions: ['.svelte', '.svx', '.md']
};

export default config;
