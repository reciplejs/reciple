<script lang="ts">
    import { resolve } from "$app/paths";
    import { mode, toggleMode } from 'mode-watcher';
    import { Links } from '$lib/helpers/constants';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import { Button } from '$lib/components/ui/button';
    import SiDiscord from '@icons-pack/svelte-simple-icons/icons/SiDiscord';
    import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';
    import SunIcon from '@lucide/svelte/icons/sun';
    import MoonIcon from '@lucide/svelte/icons/moon';
    import EqualIcon from '@lucide/svelte/icons/equal';

    let {
        scrolling = $bindable(false)
    }: {
        scrolling?: boolean
    } = $props();

    $effect(() => {
        onScroll();
    });

    function onScroll() {
        scrolling = window.scrollY > 0;
    }
</script>

<svelte:window onscroll={onScroll}/>

<header
    class={[
        "z-50 fixed top-0 left-0 h-16 w-full border-b border-transparent flex center justify-center items-center transition-all duration-300 ease-in-out",
        scrolling && "border-border! shadow bg-background/80 backdrop-blur-md"
    ]}
>
    <nav class="container max-w-7xl flex items-center gap-10 px-6">
        <a href={resolve('/(home)')} class="text-2xl sm:text-3xl font-bold -translate-y-0.5 text-primary dark:text-foreground">
            reciple
        </a>
        <div class="flex sm:justify-between justify-end items-center gap-4 w-full">
            <div class="flex gap-4 font-semibold opacity-80">
                <a href={resolve('/(main)/guide')}>Guide</a>
                <a href={resolve('/(main)/docs')}>Docs</a>
            </div>
            <ButtonGroup class="sm:flex hidden">
                <Button
                    size="icon"
                    variant="outline"
                    class="border-r-0"
                    href={Links.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <SiDiscord/>
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    class="border-x-0"
                    href={Links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <SiGithub/>
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    onclick={toggleMode}
                >
                    {#if mode.current === 'dark'}
                        <SunIcon fill="currentColor"/>
                    {:else}
                        <MoonIcon fill="currentColor"/>
                    {/if}
                </Button>
            </ButtonGroup>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {#snippet child({ props })}
                        <Button {...props} class="sm:hidden" variant="outline" size="icon">
                            <EqualIcon class="size-6"/>
                        </Button>
                    {/snippet}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onclick={() => window.open(Links.discord, '_blank')}>
                        <SiDiscord/>
                        Discord
                    </DropdownMenuItem>
                    <DropdownMenuItem onclick={() => window.open(Links.github, '_blank')}>
                        <SiGithub/>
                        Github
                    </DropdownMenuItem>
                    <DropdownMenuItem onclick={toggleMode}>
                        {#if mode.current === 'dark'}
                            <SunIcon fill="currentColor"/>
                            Light Mode
                        {:else}
                            <MoonIcon fill="currentColor"/>
                            Dark Mode
                        {/if}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </nav>
</header>
