<script lang="ts">
    import type { Location } from '@deno/doc';
    import { resolveLocationURL } from '$lib/helpers/utils';
    import { Button } from '$lib/components/ui/button';
    import { ExternalLinkIcon } from '@lucide/svelte';

    let {
        location
    }: {
        location: Location;
    } = $props();

    let gitURL = $derived(resolveLocationURL(location));
</script>

{#if gitURL}
    <Button size="sm" variant="secondary" class="shrink-0 rounded-full px-3! py-1 gap-1 h-fit text-xs" href={gitURL} target="_blank">
        <span>source</span>
        <ExternalLinkIcon class="size-3!"/>
    </Button>
{/if}
