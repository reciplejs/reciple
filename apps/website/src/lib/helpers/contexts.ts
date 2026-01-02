import { Context } from 'runed';
import type { MarkdownMetadata } from './types';

export const pageMetadata = new Context<MarkdownMetadata>('page-metadata');
