<script lang="ts">
    import { Documentation } from '$lib/helpers/classes/Documentation.svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { ArrowRightIcon, HouseIcon, PackageIcon } from '@lucide/svelte';
    import { resolve } from '$app/paths';
    import { MetaTags } from 'svelte-meta-tags';

    const metatags = {
        title: "reciple | Packages",
        description: "Choose a package to view documentation"
    };
</script>

<MetaTags
    {...metatags}
    openGraph={metatags}
    twitter={metatags}
/>

<h1 class="text-2xl sm:text-3xl font-bold text-center">Choose a package</h1>
<div class="grid gap-2">
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
</div>
<div class="flex justify-center">
    <Button variant="outline" href={resolve('/(home)')}>
        <HouseIcon/>
        Back to home
    </Button>
</div>
