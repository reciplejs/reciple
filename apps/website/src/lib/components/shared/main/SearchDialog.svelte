<script lang="ts">
    import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandLinkItem, CommandList, CommandLoading } from '$lib/components/ui/command';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import SearchIcon from '@lucide/svelte/icons/search';
    import { type Icon } from '@lucide/svelte';
    import type { Awaitable } from 'shiki';
    import { useDebounce, useThrottle } from 'runed';
    import type { ComponentType } from 'svelte';
    import type { SidebarData } from '$lib/helpers/types';

    let {
        open = $bindable(false),
        data = $bindable(),
        delay = 200,
        delayType = 'debounce',
        onFilter
    }: {
        open?: boolean;
        data: SearchData[];
        delay?: number;
        delayType?: 'debounce'|'throttle'|null;
        onFilter: (value: string) => Awaitable<SearchData[]>;
    } = $props();

    let isLoading: boolean = $state(false);
    let categories: Record<string, SearchData[]> = $derived.by(() => data
        .reduce((acc, item) => {
            if (!item.category) return acc;
            if (!acc[item.category]) acc[item.category] = [];

            acc[item.category].push(item);

            return acc;
        }, {} as Record<string, SearchData[]>)
    );

    const _debouncedFilter = useDebounce(async (value: string) => {
        data = await Promise.resolve(onFilter(value)) ?? [];
        isLoading = false;
    }, () => delay);

    const _throttledFilter = useThrottle(async (value: string) => {
        data = await Promise.resolve(onFilter(value)) ?? [];
        isLoading = false;
    }, () => delay);

    const filter = async (value: string) => {
        isLoading = delayType !== null;

        switch (delayType) {
            case 'debounce':
                return _debouncedFilter(value);
            case 'throttle':
                return _throttledFilter(value);
            case null:
                data = await Promise.resolve(onFilter(value)) ?? [];
                return;
        }
    };
</script>

<script lang="ts" module>
    export interface SearchData {
        icon?: typeof Icon|ComponentType;
        title: string;
        description?: string;
        category?: string;
        keywords?: string[];
        href: string;
        external?: boolean;
    }

    export function fromSidebarGroups(groups: SidebarData.Group[]): SearchData[] {
        const data: SearchData[] = [];

        for (const group of groups) {
            for (const [category, categoryData] of Object.entries(group.categories)) {
                for (const link of categoryData.links) {
                    data.push({
                        title: link.label,
                        description: link.metadata?.description,
                        keywords: link.metadata?.keywords,
                        href: link.href,
                        category,
                        icon: link.icon
                    });
                }
            }
        }

        return data;
    }
</script>

<svelte:window onkeydown={event => {
    const meta = event.metaKey || event.ctrlKey;
    const focusedInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    if ((meta && event.key === 'k') || (event.key === '/' && !focusedInput)) {
        event.preventDefault();
        open = true;
    }
}}/>

<CommandDialog shouldFilter={false} loop bind:open class="z-50">
    <CommandInput placeholder="Search..." oninput={e => filter(e.currentTarget.value)}/>
    <CommandList>
        {#if isLoading}
            <CommandLoading class="grid gap-2 p-2">
                <Skeleton class="h-12 w-full"/>
                <Skeleton class="h-12 w-full"/>
                <Skeleton class="h-12 w-full"/>
            </CommandLoading>
        {:else}
            <CommandEmpty class="h-44">
                <Empty class="h-full items-center">
                    <EmptyHeader class="gap-0">
                        <EmptyMedia variant="icon" class="mb-2">
                            <SearchIcon/>
                        </EmptyMedia>
                        <EmptyTitle>No results found</EmptyTitle>
                        <EmptyDescription>Try using different keywords</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </CommandEmpty>
            {#each Object.entries(categories) as [category, items] (category)}
                <CommandGroup heading={category}>
                    {#each items as item (item)}
                        <CommandLinkItem
                            class="rounded"
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            onSelect={() => open = false}
                        >
                            {#if item.icon}
                                <item.icon class="me-2 size-4"/>
                            {/if}
                            <span>{item.title}</span>
                        </CommandLinkItem>
                    {/each}
                </CommandGroup>
            {/each}
        {/if}
    </CommandList>
</CommandDialog>
