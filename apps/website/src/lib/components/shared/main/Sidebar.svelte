<script lang="ts">
    import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "$lib/components/ui/sidebar";
    import SparklesIcon from '@lucide/svelte/icons/sparkles';
    import SearchIcon from '@lucide/svelte/icons/search';
    import type { WithElementRef } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { Snippet } from 'svelte';
    import { searchDialogState, sidebarData } from '$lib/helpers/contexts';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';
    import SidebarMenus from './sidebar/SidebarMenus.svelte';
    import SidebarGroups from './sidebar/SidebarGroups.svelte';

    let {
        header,
        content,
        footer,
        ...props
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: "left" | "right";
		variant?: "sidebar" | "floating" | "inset";
		collapsible?: "offcanvas" | "icon" | "none";
        header?: Snippet;
        content?: Snippet;
        footer?: Snippet;
	} = $props();

    let data = sidebarData.get();
    let searchState = searchDialogState.getOr(undefined);
</script>

<Sidebar {...props}>
    <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onclick={() => goto(resolve('/(home)'))} size="lg" class="cursor-pointer">
                    <div class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <SparklesIcon class="size-5"/>
                    </div>
                    <div class="grid flex-1 text-start text-lg leading-tight font-bold">
                        {data.header?.title ?? 'reciple'}
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        {#if searchState !== undefined}
            <SidebarSeparator/>
            <SidebarMenu>
                <SidebarMenuItem>
                    {#if searchState.open !== undefined}
                        <SidebarMenuButton
                            tooltipContent="Search"
                            class="w-full rounded-md justify-start overflow-hidden bg-sidebar-accent/50 border border-sidebar-border"
                            onclick={() => searchState.open = true}
                        >
                            <SearchIcon/>
                            <span>Search</span>
                        </SidebarMenuButton>
                    {/if}
                </SidebarMenuItem>
            </SidebarMenu>
        {/if}
        {#if data.header?.menus?.length}
            <SidebarMenus data={data.header.menus}/>
        {/if}
        {@render header?.()}
    </SidebarHeader>
    <SidebarContent>
        {#if data.content?.groups}
            <SidebarGroups data={data.content.groups}/>
        {/if}
        {@render content?.()}
    </SidebarContent>
    {#if footer}
        <SidebarFooter>
            {@render footer()}
        </SidebarFooter>
    {/if}
</Sidebar>
