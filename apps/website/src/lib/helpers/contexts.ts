import { Context } from 'runed';
import type { MarkdownMetadata, SidebarData } from './types';

export const pageMetadata = new Context<MarkdownMetadata>('page-metadata');
export const sidebarData = new Context<SidebarData>('sidebar-data');
