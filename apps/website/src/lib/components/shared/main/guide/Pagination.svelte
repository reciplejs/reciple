<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
    import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
    import type { SidebarData } from '$lib/helpers/types';
    import { sidebarData } from '$lib/helpers/contexts';
    import { page } from '$app/state';

    let data = sidebarData.get();
    let items = $derived(data.content?.groups.reduce((current, group) => {
        current.push(...Object.values(group.categories).map(category => category.links).flat());
        return current;
    }, [] as SidebarData.GroupCategoryItem[]) || []);

    let current = $derived(items.findIndex(item => !!page.params.slug && item.href.endsWith(page.params.slug)));
    let previous = $derived(current >= 0 ? items.at(current - 1) : undefined);
    let next = $derived(current >= 0 ? items.at(current + 1) : undefined);
</script>

<div class="grid sm:grid-cols-2 gap-2 p-4">
    {#if previous}
        <Button variant="outline" size="lg" class="sm:justify-start text-start items-center h-fit py-4" href={previous.href}>
            <ArrowLeftIcon class="size-6 mr-2"/>
            <div class="grid justify-items-center sm:justify-items-start leading-tight overflow-hidden w-full mr-8">
                <span class="font-semibold">{previous?.label}</span>
                <span class="text-xs text-muted-foreground truncate text-nowrap">{previous?.metadata?.description ?? previous.href}</span>
            </div>
        </Button>
    {:else}
        <span></span>
    {/if}
    {#if next}
        <Button variant="outline" size="lg" class="sm:justify-end text-end items-center h-fit py-4" href={next?.href}>
            <div class="grid justify-items-center sm:justify-items-end leading-tight overflow-hidden w-full ml-8">
                <span class="font-semibold">{next?.label}</span>
                <span class="text-xs text-muted-foreground truncate text-nowrap">{next?.metadata?.description ?? next.href}</span>
            </div>
            <ArrowRightIcon class="size-6 ml-2"/>
        </Button>
    {:else}
        <span></span>
    {/if}
</div>
