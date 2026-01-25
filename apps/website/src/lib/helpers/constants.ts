import { DocType } from './types';
import HouseIcon from '@lucide/svelte/icons/house';
import BoxIcon from '@lucide/svelte/icons/box';
import ContainerIcon from '@lucide/svelte/icons/container';
import SquareFunctionIcon from '@lucide/svelte/icons/square-function';
import VariableIcon from '@lucide/svelte/icons/variable';
import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
import BlocksIcon from '@lucide/svelte/icons/blocks';
import WorkflowIcon from '@lucide/svelte/icons/workflow';
import type { Icon } from '@lucide/svelte';
import type { ClassValue } from 'svelte/elements';

export const Links = {
    github: 'https://github.com/reciplejs/reciple',
    discord: 'https://discord.gg/KxfPZYuTGV',
    discordJs: 'https://discord.js.org/',
}

export const DocTypeIcons: Record<DocType, typeof Icon> = {
    [DocType.Home]: HouseIcon,
    [DocType.Class]: BoxIcon,
    [DocType.Namespace]: ContainerIcon,
    [DocType.Function]: SquareFunctionIcon,
    [DocType.Variable]: VariableIcon,
    [DocType.Enum]: ScrollTextIcon,
    [DocType.Interface]: BlocksIcon,
    [DocType.TypeAlias]: WorkflowIcon
};

export const proseClasses: ClassValue = [
    "prose prose-neutral prose-sm @3xl:prose-base dark:prose-invert max-w-none",
    "prose-code:after:content-none prose-code:before:content-none prose-code:bg-foreground/15 prose-code:py-0.5 prose-code:px-1 prose-code:rounded-md",
    "prose-pre:prose-code:rounded-none prose-pre:prose-code:p-0 prose-pre:prose-code:bg-transparent prose-pre:leading-tight",
    "prose-blockquote:prose-p:before:content-none prose-blockquote:prose-p:after:content-none",
    "prose-a:text-primary dark:prose-a:text-blue-400 prose-a:no-underline"
]

export const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
