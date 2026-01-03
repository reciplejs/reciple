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
        groups: SidebarData.Group[];
    }
}

export namespace SidebarData {
    export interface Group {
        label?: string;
        icon?: typeof Icon;
        categories: Record<string, GroupCategory>;
    }

    export interface GroupCategory {
        open?: boolean;
        icon?: typeof Icon;
        links: GroupCategoryItem[];
    }

    export interface GroupCategoryItem {
        label: string;
        metadata?: MarkdownMetadata;
        href: string;
        external?: boolean;
        icon?: typeof Icon;
    }
}
