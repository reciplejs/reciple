<script lang="ts">
    import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from "$lib/components/ui/sidebar";
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
    import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
    import SparklesIcon from '@lucide/svelte/icons/sparkles';
    import SearchIcon from '@lucide/svelte/icons/search';
    import type { WithElementRef } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { Snippet } from 'svelte';
    import { searchDialogState, sidebarData } from '$lib/helpers/contexts';
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { ChevronsUpDownIcon } from '@lucide/svelte';

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
            <SidebarMenu>
                {#each data.header.menus as menu}
                    {@const active = menu.active ? menu.items.find(i => i.name === menu.active) : null}
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                {#snippet child({ props })}
                                    <SidebarMenuButton
                                        {...props}
                                        size="lg"
                                        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                        tooltipContent={menu.label}
                                    >
                                        <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                            {#if active?.icon}
                                                <active.icon class="size-4.5"/>
                                            {:else if menu.icon}
                                                <menu.icon class="size-4.5"/>
                                            {/if}
                                        </div>
                                        <div class="grid flex-1 text-start text-sm leading-tight">
                                            <span class="truncate font-medium">{menu.label}</span>
                                        </div>
                                        <ChevronsUpDownIcon class="ms-auto" />
                                    </SidebarMenuButton>
                                {/snippet}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent class="w-(--bits-dropdown-menu-anchor-width) text-nowrap min-w-2xs mx-2">
                                {#each menu.items as item}
                                    {@const isActive = item.name === active?.name}
                                    <DropdownMenuItem
                                        class={[
                                            isActive && "text-primary! font-medium bg-primary/10! dark:bg-primary! dark:text-primary-foreground!",
                                        ]}
                                        onclick={() => item.external ? window.open(item.href, '_blank') : goto(item.href)}
                                    >
                                        {#if item.icon}
                                            <item.icon/>
                                        {/if}
                                        <span>{item.name}</span>
                                    </DropdownMenuItem>
                                {/each}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                {/each}
            </SidebarMenu>
        {/if}
        {@render header?.()}
    </SidebarHeader>
    <SidebarContent>
        {#if data.content?.groups}
            {#each data.content.groups as group (group.label)}
                <SidebarGroup>
                    {#if group.label}
                        <SidebarGroupLabel>
                            {group.label}
                        </SidebarGroupLabel>
                    {/if}
                    <SidebarGroupContent>
                        {#each Object.keys(group.categories) as label (label)}
                            {@const category = group.categories[label]}
                            {#if category.links.length}
                                <SidebarMenu>
                                    <Collapsible open class="group/collapsible overflow-hidden">
                                        {#snippet child({ props })}
                                            <SidebarMenuItem {...props}>
                                                <CollapsibleTrigger class="z-10 relative">
                                                    {#snippet child({ props })}
                                                        <SidebarMenuButton {...props}>
                                                            {#if category.icon}
                                                                <category.icon/>
                                                            {/if}
                                                            <span>{label}</span>
                                                            <ChevronRightIcon class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                                                        </SidebarMenuButton>
                                                    {/snippet}
                                                </CollapsibleTrigger>
                                                <CollapsibleContent class="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                                                    <SidebarMenuSub>
                                                        {#each category.links as item (item.label + item.href)}
                                                            {@const isActive = !!page.params.slug && item.href.endsWith(page.params.slug)}
                                                            <SidebarMenuSubItem>
                                                                <SidebarMenuSubButton
                                                                    href={item.href}
                                                                    target={item.external ? '_blank' : undefined}
                                                                    class={[
                                                                        isActive && "text-primary! font-medium bg-primary/10! dark:bg-primary! dark:text-primary-foreground!",
                                                                    ]}
                                                                >
                                                                    {#if item.icon}
                                                                        <item.icon/>
                                                                    {/if}
                                                                    <span>{item.label}</span>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        {/each}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        {/snippet}
                                    </Collapsible>
                                </SidebarMenu>
                            {/if}
                        {/each}
                    </SidebarGroupContent>
                </SidebarGroup>
            {/each}
        {/if}
        {@render content?.()}
    </SidebarContent>
    {#if footer}
        <SidebarFooter>
            {@render footer()}
        </SidebarFooter>
    {/if}
</Sidebar>
