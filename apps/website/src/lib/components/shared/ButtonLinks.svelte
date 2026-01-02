<script lang="ts">
    import type { ButtonGroupOrientation } from '$lib/components/ui/button-group/button-group.svelte';
    import { ButtonGroup } from '$lib/components/ui/button-group';
    import { Button } from '$lib/components/ui/button';
    import { Links } from '$lib/helpers/constants';
    import { mode, toggleMode } from 'mode-watcher';
    import SiDiscord from '@icons-pack/svelte-simple-icons/icons/SiDiscord';
    import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';
    import SunIcon from '@lucide/svelte/icons/sun';
    import MoonIcon from '@lucide/svelte/icons/moon';
    import type { WithElementRef } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';

    let props: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: ButtonGroupOrientation;
	} = $props();
</script>

<ButtonGroup class="sm:flex hidden" {...props}>
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
