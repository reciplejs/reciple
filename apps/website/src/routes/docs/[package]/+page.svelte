<script lang="ts">
    import { Documentation } from '$lib/helpers/classes/Documentation.svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { ArrowRightIcon, HouseIcon, PackageIcon } from '@lucide/svelte';
    import { resolve } from '$app/paths';

    let { data } = $props();
</script>

<h1 class="text-2xl sm:text-3xl font-bold text-center mb-4">Choose a tag</h1>
{#await Documentation.fetchTags(data.package)}
    {#each { length: 5 } as _}
        <Skeleton class="h-10"/>
    {/each}
{:then tags}
    {#each tags as tag}
        <Button
            variant="secondary"
            class="justify-start"
            size="lg"
            href={resolve('/(main)/docs/[package]/[tag]', {
                package: data.package,
                tag: tag
            })}
        >
            <PackageIcon/>
            {tag}
            <ArrowRightIcon class="ms-auto"/>
        </Button>
    {/each}
{/await}
<div class="flex justify-center mt-4">
    <Button variant="outline" href={resolve('/(home)')}>
        <HouseIcon/>
        Back to home
    </Button>
</div>
