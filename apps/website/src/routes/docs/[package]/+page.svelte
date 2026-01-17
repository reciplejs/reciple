<script lang="ts">
    import { Documentation } from '$lib/helpers/classes/Documentation.svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { ArrowRightIcon, HouseIcon, TagIcon } from '@lucide/svelte';
    import { resolve } from '$app/paths';
    import { MetaTags } from 'svelte-meta-tags';

    let { data } = $props();

    let metatags = $derived({
        title: `reciple | ${data.package} tags`,
        description: `Choose a tag for ${data.package} documentation`
    });
</script>

<MetaTags
    {...metatags}
    openGraph={metatags}
    twitter={metatags}
/>

<h1 class="text-2xl sm:text-3xl font-bold text-center">Choose a tag</h1>
<div class="grid gap-2">
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
                <TagIcon/>
                {tag}
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
