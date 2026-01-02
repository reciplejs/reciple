<script lang="ts">
    import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from "$lib/components/ui/sidebar";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
    import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
    import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
    import PackageIcon from '@lucide/svelte/icons/package';
    import GalleryHorizontalEndIcon from '@lucide/svelte/icons/gallery-horizontal-end';
    import SparklesIcon from '@lucide/svelte/icons/sparkles';
    import SearchIcon from '@lucide/svelte/icons/search';
    import type { WithElementRef } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { Snippet } from 'svelte';
    import { sidebarData } from '../../../helpers/contexts';
    import { page } from '$app/state';

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
                <SidebarMenuButton size="lg" class="bg-transparent!">
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
            <SidebarMenuItem class="mb-2">
                <SidebarMenuButton
                    tooltipContent="Search"
                    class="w-full rounded-md justify-start overflow-hidden bg-sidebar-accent/50 border border-sidebar-border"
                >
                    <SearchIcon/>
                    <span>Search</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <SidebarMenuButton
                                {...props}
                                size="lg"
                                tooltipContent="Packages"
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <PackageIcon class="size-4.5"/>
                                </div>
                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    <span class="truncate font-medium">
                                        reciple
                                    </span>
                                </div>
                                <ChevronsUpDownIcon class="ms-auto" />
                            </SidebarMenuButton>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-(--bits-dropdown-menu-anchor-width) text-nowrap min-w-2xs mx-2">
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">@reciple/core</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">@reciple/utils</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">@reciple/jsx</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">@reciple/modules</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <SidebarMenuButton
                                {...props}
                                size="lg"
                                tooltipContent="Versions"
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <GalleryHorizontalEndIcon class="size-4.5"/>
                                </div>
                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    <span class="truncate font-medium">
                                        10.0.1
                                    </span>
                                </div>
                                <ChevronsUpDownIcon class="ms-auto" />
                            </SidebarMenuButton>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-(--bits-dropdown-menu-anchor-width) text-nowrap min-w-2xs mx-2">
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">main</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">9.0.0</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">8.0.0</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PackageIcon/>
                            <span class="truncate">7.0.0</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
