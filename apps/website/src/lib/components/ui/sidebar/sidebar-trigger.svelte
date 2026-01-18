<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/helpers/utils.js";
	import PanelLeftCloseIcon from "@lucide/svelte/icons/panel-left-close";
	import PanelLeftOpenIcon from "@lucide/svelte/icons/panel-left-open";
	import type { ComponentProps, Snippet } from "svelte";
	import { useSidebar } from "./context.svelte.js";
	import type { Icon } from '@lucide/svelte';

	let {
		ref = $bindable(null),
		class: className,
		onclick,
        closeIcon,
        openIcon,
        children,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
        closeIcon?: typeof Icon;
        openIcon?: typeof Icon;
        children?: Snippet;
	} = $props();

	const sidebar = useSidebar();
</script>

<Button
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon"
	class={cn("size-7", className)}
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	{...restProps}
>
	{#if sidebar.isMobile ? sidebar.openMobile : sidebar.open}
        {@const CloseIcon = closeIcon ?? PanelLeftCloseIcon}
        <CloseIcon/>
    {:else}
        {@const OpenIcon = openIcon ?? PanelLeftOpenIcon}
        <OpenIcon/>
    {/if}
    {@render children?.()}
	<span class="sr-only">Toggle Sidebar</span>
</Button>
