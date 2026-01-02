<script lang="ts">
    import { SidebarMenuButton, SidebarMenuItem } from "$lib/components/ui/sidebar";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
    import PackageIcon from '@lucide/svelte/icons/package';
    import GalleryHorizontalEndIcon from '@lucide/svelte/icons/gallery-horizontal-end';
</script>

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
                <GalleryHorizontalEndIcon/>
                <span class="truncate">main</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <GalleryHorizontalEndIcon/>
                <span class="truncate">9.0.0</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <GalleryHorizontalEndIcon/>
                <span class="truncate">8.0.0</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <GalleryHorizontalEndIcon/>
                <span class="truncate">7.0.0</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</SidebarMenuItem>
