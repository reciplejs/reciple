<script lang="ts">
    import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from "$lib/components/ui/sidebar";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
    import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
    import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
    import PackageIcon from '@lucide/svelte/icons/package';
    import KeyIcon from '@lucide/svelte/icons/key';
    import SearchIcon from '@lucide/svelte/icons/search';
    import type { WithElementRef } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';

    let props: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: "left" | "right";
		variant?: "sidebar" | "floating" | "inset";
		collapsible?: "offcanvas" | "icon" | "none";
	} = $props();
</script>

<Sidebar {...props}>
    <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <SidebarMenuButton
                                {...props}
                                size="lg"
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <PackageIcon/>
                                </div>
                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    <span class="truncate font-medium">
                                        reciple
                                    </span>
                                    <span class="truncate text-xs">
                                        v10.0.1
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
        </SidebarMenu>
        <SidebarGroup class="py-0 px-0">
            <SidebarGroupContent class="relative">
                <SidebarMenuButton class="w-full justify-start overflow-hidden bg-sidebar-accent/50 border border-sidebar-border">
                    <SearchIcon/>
                    <span>Search</span>
                </SidebarMenuButton>
            </SidebarGroupContent>
        </SidebarGroup>
    </SidebarHeader>
    <SidebarSeparator/>
    <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>
                Getting Started
            </SidebarGroupLabel>
            <SidebarGroupContent>
                {#each [...'qwertyuiop'] as i (i)}
                    <SidebarMenu>
                        <Collapsible open class="group/collapsible">
                            {#snippet child({ props })}
                                <SidebarMenuItem {...props}>
                                    <CollapsibleTrigger>
                                        {#snippet child({ props })}
                                            <SidebarMenuButton {...props}>
                                                <KeyIcon/>
                                                <span>Classes {i}</span>
                                                <ChevronRightIcon class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                                            </SidebarMenuButton>
                                        {/snippet}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {#each [...'asdfghjkl'] as x (x)}
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton>
                                                        <a href="#">
                                                            <span>Example {x}</span>
                                                        </a>
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
        <SidebarGroup></SidebarGroup>
    </SidebarContent>
</Sidebar>
