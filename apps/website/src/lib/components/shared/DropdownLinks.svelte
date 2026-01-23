<script lang="ts">
    import { mode, toggleMode } from 'mode-watcher';
    import { Links } from '$lib/helpers/constants';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Button, type ButtonProps } from '$lib/components/ui/button';
    import SiDiscord from '@icons-pack/svelte-simple-icons/icons/SiDiscord';
    import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';
    import SunIcon from '@lucide/svelte/icons/sun';
    import MoonIcon from '@lucide/svelte/icons/moon';
    import EqualIcon from '@lucide/svelte/icons/equal';

    let btnProps: ButtonProps = $props();
</script>

<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            <Button {...props} class="sm:hidden rounded-lg" variant="secondary" size="icon" {...btnProps}>
                <EqualIcon class="size-6"/>
            </Button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onclick={() => window.open(Links.discord, '_blank')}>
            <SiDiscord/>
            Discord
            <span class="sr-only">Go to discord</span>
        </DropdownMenuItem>
        <DropdownMenuItem onclick={() => window.open(Links.github, '_blank')}>
            <SiGithub/>
            Github
            <span class="sr-only">Go to github</span>
        </DropdownMenuItem>
        <DropdownMenuItem onclick={toggleMode}>
            {#if mode.current === 'dark'}
                <SunIcon fill="currentColor"/>
                Light Mode
            {:else}
                <MoonIcon fill="currentColor"/>
                Dark Mode
            {/if}
            <span class="sr-only">Toggle theme</span>
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
