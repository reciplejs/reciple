import type { Icon } from '@lucide/svelte';
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

export enum DocType {
    Home = 'home',
    Class = 'class',
    Namespace = 'namespace',
    Function = 'function',
    Variable = 'variable',
    Enum = 'enum',
    Interface = 'interface',
    TypeAlias = 'typeAlias'
}

export interface SidebarData {
    header?: {
        title: string;
        menus?: SidebarData.Menu[];
    }
    content?: {
        groups: SidebarData.Group[];
    }
}

export namespace SidebarData {
    export interface Menu {
        label: string;
        icon?: typeof Icon|ComponentType;
        active?: string;
        items: MenuItem[];
    }

    export interface MenuItem {
        name: string;
        href: string;
        external?: boolean;
        icon?: typeof Icon|ComponentType;
    }

    export interface Group {
        label?: string;
        categories: Record<string, GroupCategory>;
    }

    export interface GroupCategory {
        open?: boolean;
        icon?: typeof Icon|ComponentType;
        links: GroupCategoryItem[];
    }

    export interface GroupCategoryItem {
        label: string;
        metadata?: MarkdownMetadata;
        href: string;
        external?: boolean;
        deprecated?: boolean;
        icon?: typeof Icon|ComponentType;
    }
}
