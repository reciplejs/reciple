import type { Location } from '@deno/doc';
import { clsx, type ClassValue } from "clsx";
import { slug } from 'github-slugger';
import { createHighlighter } from 'shiki';
import { twMerge } from "tailwind-merge";
import { semverRegex } from './constants';

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

export function filterArrayDuplicate<T extends any[]>(items: T, key: keyof typeof items[number]|(string & {})): T
export function filterArrayDuplicate<T extends any[]>(items: T, isNotDuplicate: (data: { item: T[number]; index: number; items: T; }) => boolean): T
export function filterArrayDuplicate<T extends any[]>(items: T, keyOrFn: ((data: { item: T[number]; index: number; items: T; }) => boolean)|keyof typeof items[number]|(string & {})): T
export function filterArrayDuplicate<T extends any[]>(items: T, keyOrFn: ((data: { item: T[number]; index: number; items: T; }) => boolean)|keyof typeof items[number]|(string & {})): T {
    const isNotDuplicate: ((data: { item: T[number]; index: number; items: T; }) => boolean) = typeof keyOrFn !== 'function'
            ? (data) => data.items.findIndex(item => item[keyOrFn] === data.item[keyOrFn]) === data.index
            : keyOrFn;

    return items.filter((item, index) => isNotDuplicate({ item, index, items })) as T;
}

export function resolveLocationURL(location: Location): string|null {
    const url = `${location.filename}#L${location.line}-${location.col}`;
    return url.startsWith('http') ? url : null;
}

export function filterAndSortTags(tags: string[]): string[] {
    let versions = tags.filter(tag => semverRegex.test(tag));
    let branches = tags.filter(tag => !versions.includes(tag));

    const newVersions: string[] = [];
    const latestPatches: Record<string, number> = {};

    for (const version of versions) {
        const [_, major, minor, patch] = version.match(semverRegex) || [];
        if (!major || !minor || !patch) continue;

        const majorMinor = `${major}.${minor}`;
        const currentPatch = isNaN(Number(patch)) ? 0 : Number(patch);
        const latestPatch = Math.max(latestPatches[majorMinor] ?? 0, currentPatch);

        latestPatches[majorMinor] = latestPatch;
    }

    for (const [majorMinor, latestPatch] of Object.entries(latestPatches)) {
        newVersions.push(`${majorMinor}.${latestPatch}`);
    }

    return [...branches, ...newVersions.reverse()];
}
