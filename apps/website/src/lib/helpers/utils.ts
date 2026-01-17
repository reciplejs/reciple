import { clsx, type ClassValue } from "clsx";
import { slug } from 'github-slugger';
import { createHighlighter } from 'shiki';
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function normalizeGuidePageId(id: string) {
    const [_, ...parts] = id.split('.');

    return slug(parts.join('.').replace('.md', '').replace('.svx', ''));
}

export function normalizeGuideCategoryId(id: string) {
    const [_, ...parts] = id.split('.');

    return slug(parts.join('.'));
}

export const themes: Record<string, import('shiki').BundledTheme> = {
    light: 'github-light',
    dark: 'dark-plus'
};

export const highlighter = await createHighlighter({
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
