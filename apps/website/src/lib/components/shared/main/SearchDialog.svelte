<script lang="ts">
    import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandLinkItem, CommandList, CommandLoading } from '$lib/components/ui/command';
    import { SearchIcon, type Icon } from '@lucide/svelte';
    import { Skeleton } from '../../ui/skeleton';
    import type { Awaitable } from 'shiki';
    import { useDebounce } from 'runed';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../ui/empty';

    let {
        open = $bindable(false),
        data = $bindable(),
        onFilter
    }: {
        open?: boolean;
        data: SearchData[];
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

    const _filter = useDebounce(async (value: string) => {
        data = await Promise.resolve(onFilter(value)) ?? [];
        isLoading = false;
    }, 0);

    const filter = async (value: string) => {
        isLoading = true;
        await _filter(value);
    };
</script>

<script module>
    export interface SearchData {
        icon?: typeof Icon;
        title: string;
        description?: string;
        category?: string;
        href: string;
        external?: boolean;
    }
</script>

<svelte:window onkeydown={event => {
    const meta = event.metaKey || event.ctrlKey;

    if (meta && event.key === 'k') {
        event.preventDefault();
        open = true;
    }
}}/>

<CommandDialog shouldFilter={false} loop bind:open>
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
