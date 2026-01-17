<script lang="ts">
    import type { TsTypeDef } from '@deno/doc';

    let {
        types
    }: {
        types: TsTypeDef[];
    } = $props();
</script>

<!-- TODO: Add links to respective types -->

{#snippet TypeDef(type: TsTypeDef)}
    {#if type.kind === 'array'}
        <span>{@render TypeDef(type.array)}[]</span>
    {:else if type.kind === 'union'}
        <span>
            {#each type.union as subType, i}
                {#if i > 0}<span>|</span>{/if}{@render TypeDef(subType)}
            {/each}
        </span>
    {:else if type.kind === 'typeRef'}
        {type.typeRef.typeName}{#if type.typeRef.typeParams?.length}&lt;{#each type.typeRef.typeParams as typeParam, i}
            {#if i > 0}
                <span>,
                    <span></span>
                </span>
            {/if}{@render TypeDef(typeParam)}
        {/each}&gt;
        {/if}
    {:else}
        <span>{type.repr}</span>
    {/if}
{/snippet}

<span>
    {#each types as type, i}
        {#if i > 0}
            <span>|</span>
        {/if}
        {@render TypeDef(type)}
    {/each}
</span>
