import type { Component } from 'svelte';
import { Icon } from '@lucide/svelte';

export interface MarkdownMetadata {
	title?: string;
    category?: string;
	description?: string;
    keywords?: string[];
};

export interface MarkdownModules<Metadata = MarkdownMetadata> {
    [key: string]: () => Promise<{
        default: Component;
        metadata?: Metadata;
    }>
};

export interface SidebarData {
    content?: {
        groups: {
            label?: string;
            icon?: typeof Icon;
            categories: Record<string, {
                open?: boolean;
                icon?: typeof Icon;
                links: {
                    label: string;
                    href: string;
                    external?: boolean;
                    icon?: typeof Icon;
                }[];
            }>;
        }[];
    }
}
