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
