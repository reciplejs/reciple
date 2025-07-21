import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { JSX } from './structures/JSX.js';

export const jsx = JSX.useElement;
export const jsxs = JSX.useElement;
export const Fragment = JSX.useFragment;

export interface IntrinsicElements {
    actionRow: ActionRowBuilder;
    button: ButtonBuilder;
}

export type Element = ActionRowBuilder|ButtonBuilder;

export type ElementClass = Function;

interface ElementChildrenAttribute {
    children: {};
}
