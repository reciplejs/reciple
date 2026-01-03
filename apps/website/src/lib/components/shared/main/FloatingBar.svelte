<script lang="ts">
    import { MoonIcon, SearchIcon, SunIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import { SidebarTrigger, useSidebar } from '$lib/components/ui/sidebar';
    import { searchDialogState } from '$lib/helpers/contexts';
    import { mode, toggleMode } from 'mode-watcher';

    let sidebar = useSidebar();
    let searchState = searchDialogState.getOr(undefined);
</script>

<div class="fixed bottom-0 left-0 w-full flex justify-center p-4" class:hidden={!sidebar.isMobile}>
    <ButtonGroup class="container w-fit bg-background/70 dark:bg-background/50 backdrop-blur-sm border rounded-full p-1 gap-0 shadow-sm">
        <SidebarTrigger size="icon-lg" class="size-10 rounded-full!"/>
        {#if searchState !== undefined}
            <Button
                variant="ghost"
                size="icon-lg"
                class="size-10 rounded-full!"
                onclick={() => searchState.open = true}
            >
                <SearchIcon/>
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
        </Button>
    </ButtonGroup>
</div>
<div class="h-16" class:hidden={!sidebar.isMobile}></div>
