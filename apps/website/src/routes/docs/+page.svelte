<script lang="ts">
    import { Documentation } from '$lib/helpers/classes/Documentation.svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { ArrowRightIcon, HouseIcon, PackageIcon } from '@lucide/svelte';
    import { resolve } from '$app/paths';

    let { data } = $props();
</script>

<h1 class="text-2xl sm:text-3xl font-bold text-center mb-4">Choose a package</h1>
{#await Documentation.fetchPackages()}
    {#each { length: 5 } as _}
        <Skeleton class="h-10"/>
    {/each}
{:then packages}
    {#each packages as pkg}
        <Button
            variant="secondary"
            class="justify-start"
            size="lg"
            href={resolve('/docs/[package]', { package: pkg })}
        >
            <PackageIcon/>
            {pkg}
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
