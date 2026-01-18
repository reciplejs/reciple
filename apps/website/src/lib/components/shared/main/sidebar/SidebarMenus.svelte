<script lang="ts">
    import type { SidebarData } from '$lib/helpers/types';
    import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '$lib/components/ui/sidebar';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { ChevronsUpDownIcon } from '@lucide/svelte';
    import { goto } from '$app/navigation';

    let {
        data
    }: {
        data: SidebarData.Menu[];
    } = $props();

    const sidebar = useSidebar();
</script>

<SidebarMenu>
    {#each data as menu}
        {@const active = menu.active ? menu.items.find(i => i.name === menu.active) : null}
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {#snippet child({ props })}
                        <SidebarMenuButton
                            {...props}
                            size="lg"
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
                                <span class="truncate font-medium">{active?.name || menu.label}</span>
                            </div>
                            <ChevronsUpDownIcon class="ms-auto" />
                        </SidebarMenuButton>
                    {/snippet}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="w-(--bits-dropdown-menu-anchor-width) text-nowrap min-w-2xs mx-2"
                    side={sidebar.open ? "bottom" : "right"}
                    align={sidebar.open ? "center" : "start"}
                >
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
