import type { Component } from 'svelte';

export type MarkdownMetadata = {
	title?: string;
	description?: string;
};

export type MarkdownModules<Metadata = MarkdownMetadata> = {
    [key: string]: () => Promise<{
        default: Component;
        metadata?: Metadata;
    }>
};
