<script lang="ts" generics="T extends any">
    import type { Snippet } from 'svelte';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '../../../ui/select';

    let {
        data,
        children,
        index = $bindable(0)
    }: {
        data: T[];
        children: Snippet<[{ index: number; item: T; }]>;
        index?: number;
    } = $props();

    let item = $derived(data[index]);
</script>

{@render children({ index, item })}
{#if data.length > 1}
    <div class="mt-2">
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
{/if}
