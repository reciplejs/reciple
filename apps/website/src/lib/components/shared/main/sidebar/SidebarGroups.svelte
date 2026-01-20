<script lang="ts">
    import type { SidebarData } from '$lib/helpers/types';
    import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '$lib/components/ui/sidebar';
    import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
    import { ChevronRightIcon } from '@lucide/svelte';
    import { page } from '$app/state';
    import { filterDuplicateSidebarGroupCategoryItem } from '$lib/helpers/utils';

    let {
        data
    }: {
        data: SidebarData.Group[];
    } = $props();

    const sidebar = useSidebar();
</script>

{#each data as group (group.label)}
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
                                            {#each filterDuplicateSidebarGroupCategoryItem(category.links) as item (item.label + item.href)}
                                                {@const isActive = !!page.params.slug && item.href.endsWith(page.params.slug)}
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        href={item.href}
                                                        target={item.external ? '_blank' : undefined}
                                                        class={[
                                                            isActive && "text-primary! font-medium bg-primary/15! dark:bg-primary/15! dark:text-primary!",
                                                            item.deprecated && "line-through opacity-50"
                                                        ]}
                                                        style="content-visibility: auto;"
                                                        title={item.deprecated ? `(Deprecated) ${item.label}` : item.label}
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
