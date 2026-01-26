import { Context } from 'runed';
import type { SidebarData } from './types';
import type { Documentation } from './classes/Documentation.svelte';

export const sidebarData = new Context<SidebarData>('sidebar-data');
export const searchDialogState = new Context<{ open?: boolean; }>('search-dialog-state');
export const documentationState = new Context<{ documentation: Documentation; }>('documentation-state');
