<script lang="ts">
    import { HouseIcon, ListIndentDecreaseIcon, MoonIcon, SearchIcon, SunIcon, TextAlignStartIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import { SidebarTrigger, useSidebar } from '$lib/components/ui/sidebar';
    import { searchDialogState } from '$lib/helpers/contexts';
    import { mode, toggleMode } from 'mode-watcher';
    import { resolve } from '$app/paths';
    import type { ClassValue } from 'svelte/elements';

    let sidebar = useSidebar();
    let searchState = searchDialogState.getOr(undefined);

    const buttonClass: ClassValue = [
        "h-13 px-5! py-2 pb-1 w-fit flex-col rounded-full! gap-0",
        "[&>span]:text-[0.7rem]!  [&>span]:opacity-60 [&>span]:mt-auto",
        "[&>svg]:size-5!"
    ];
</script>

<div class="fixed z-50 bottom-0 left-0 w-full flex justify-center p-4" class:hidden={!sidebar.isMobile}>
    <ButtonGroup class="container w-fit max-w-full overflow-auto bg-background/80 dark:bg-background/60 backdrop-blur-sm border rounded-full p-1 gap-0 shadow-sm">
        <SidebarTrigger
            size="lg"
            class={buttonClass}
            openIcon={TextAlignStartIcon}
            closeIcon={ListIndentDecreaseIcon}
        >
        <span>Menu</span>
        </SidebarTrigger>
        {#if searchState?.open !== undefined}
            <Button
                variant="ghost"
                size="lg"
                class={buttonClass}
                onclick={() => searchState.open = true}
            >
                <SearchIcon/>
                <span>Search</span>
                <span class="sr-only">Open search</span>
            </Button>
        {/if}
        <Button
            variant="ghost"
            size="lg"
            class={buttonClass}
            href={resolve('/(home)')}
        >
            <HouseIcon/>
            <span>Home</span>
            <span class="sr-only">Go to home</span>
        </Button>
        <Button
            variant="ghost"
            size="lg"
            class={buttonClass}
            onclick={toggleMode}
        >
            {#if mode.current === 'dark'}
                <SunIcon/>
            {:else}
                <MoonIcon/>
            {/if}
            <span>Theme</span>
            <span class="sr-only">Toggle theme</span>
        </Button>
    </ButtonGroup>
</div>
<div class="h-16" class:hidden={!sidebar.isMobile}></div>
