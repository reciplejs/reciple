import type { Component } from 'svelte';

export interface MarkdownMetadata {
	title?: string;
	description?: string;
};

export interface MarkdownModules<Metadata = MarkdownMetadata> {
    [key: string]: () => Promise<{
        default: Component;
        metadata?: Metadata;
    }>
};

export interface SidebarData {
    
}
