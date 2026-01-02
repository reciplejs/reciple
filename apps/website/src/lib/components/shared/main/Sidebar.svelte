<script lang="ts">
    import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from "$lib/components/ui/sidebar";
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
    import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
    import SparklesIcon from '@lucide/svelte/icons/sparkles';
    import SearchIcon from '@lucide/svelte/icons/search';
    import type { WithElementRef } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { Snippet } from 'svelte';
    import { sidebarData } from '../../../helpers/contexts';
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import { goto } from '$app/navigation';

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
                        reciple
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator/>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltipContent="Search"
                    class="w-full rounded-md justify-start overflow-hidden bg-sidebar-accent/50 border border-sidebar-border"
                >
                    <SearchIcon/>
                    <span>Search</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        {@render header?.()}
    </SidebarHeader>
    <SidebarSeparator/>
    <SidebarContent>
        {#if data.content?.groups}
            {#each data.content.groups as group (group.label)}
                <SidebarGroup>
                    {#if group.label}
                        <SidebarGroupLabel>
                            {#if group.icon}
                                <group.icon/>
                            {/if}
                            {group.label}
                        </SidebarGroupLabel>
                    {/if}
                    <SidebarGroupContent>
                        {#each Object.keys(group.categories) as label (label)}
                            {@const category = group.categories[label]}
                            <SidebarMenu>
                                <Collapsible open class="group/collapsible">
                                    {#snippet child({ props })}
                                        <SidebarMenuItem {...props}>
                                            <CollapsibleTrigger>
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
                                            <CollapsibleContent>
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
