<script lang="ts">
    import { ListIndentDecreaseIcon, MoonIcon, SearchIcon, SunIcon, TextAlignStartIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import { SidebarTrigger, useSidebar } from '$lib/components/ui/sidebar';
    import { searchDialogState } from '$lib/helpers/contexts';
    import { mode, toggleMode } from 'mode-watcher';

    let sidebar = useSidebar();
    let searchState = searchDialogState.getOr(undefined);
</script>

<div class="fixed z-50 bottom-0 left-0 w-full flex justify-center p-4" class:hidden={!sidebar.isMobile}>
    <ButtonGroup class="container w-fit bg-background/80 dark:bg-background/60 backdrop-blur-sm border rounded-full p-1 gap-0 shadow-sm">
        <SidebarTrigger
            size="icon-lg"
            class="size-10 rounded-full!"
            openIcon={TextAlignStartIcon}
            closeIcon={ListIndentDecreaseIcon}
        />
        {#if searchState !== undefined}
            <Button
                variant="ghost"
                size="icon-lg"
                class="size-10 rounded-full!"
                onclick={() => searchState.open = true}
            >
                <SearchIcon/>
                <span class="sr-only">Open search</span>
            </Button>
        {/if}
        <Button
            variant="ghost"
            size="icon-lg"
            class="size-10 rounded-full!"
            onclick={toggleMode}
        >
            {#if mode.current === 'dark'}
                <SunIcon/>
            {:else}
                <MoonIcon/>
            {/if}
            <span class="sr-only">Toggle theme</span>
        </Button>
    </ButtonGroup>
</div>
<div class="h-16" class:hidden={!sidebar.isMobile}></div>
