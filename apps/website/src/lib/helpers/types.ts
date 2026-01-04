import type { Component, ComponentType } from 'svelte';

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
        categories: Record<string, GroupCategory>;
    }

    export interface GroupCategory {
        open?: boolean;
        icon?: Component|ComponentType;
        links: GroupCategoryItem[];
    }

    export interface GroupCategoryItem {
        label: string;
        metadata?: MarkdownMetadata;
        href: string;
        external?: boolean;
        icon?: Component|ComponentType;
    }
}
