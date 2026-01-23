import { Context } from 'runed';
import type { MarkdownMetadata, SidebarData } from './types';
import type { Documentation } from './classes/Documentation.svelte';

export const pageMetadata = new Context<MarkdownMetadata>('page-metadata');
export const sidebarData = new Context<SidebarData>('sidebar-data');
export const searchDialogState = new Context<{ open?: boolean; }>('search-dialog-state');
export const documentationState = new Context<{ documentation: Documentation; }>('documentation-state');
