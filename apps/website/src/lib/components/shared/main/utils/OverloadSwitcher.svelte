<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
    import { cn } from '$lib/helpers/utils';
    import type { HTMLAttributes } from 'svelte/elements';

    let {
        data,
        children,
        select,
        index = $bindable(0)
    }: {
        data: T[];
        children: Snippet<[{ index: number; item: T; selectMenu: Snippet<[HTMLAttributes<HTMLDivElement>]>; }]>;
        select?: Snippet<[{ values: T[]; selectMenu: Snippet<[HTMLAttributes<HTMLDivElement>]>; }]>|boolean;
        index?: number;
    } = $props();

    let item = $derived(data[index]);
</script>

{#snippet SelectMenu({ class: className }: HTMLAttributes<HTMLDivElement> = {})}
    <div class={cn("mt-2", className)}>
        <Select
            type="single"
            bind:value={
                () => String(index),
                v => index = Number(v)
            }
        >
            <SelectTrigger>
                Overload {index + 1}
            </SelectTrigger>
            <SelectContent>
                {#each data as item, i}
                    <SelectItem value={String(i)}>
                        Overload {i + 1}
                    </SelectItem>
                {/each}
            </SelectContent>
        </Select>
    </div>
{/snippet}

{@render children({ index, item, selectMenu: SelectMenu })}

{#if data.length > 1}
    {#if typeof select === 'function'}
        {@render select({ values: data, selectMenu: SelectMenu })}
    {:else if select}
        {@render SelectMenu()}
    {/if}
{/if}
