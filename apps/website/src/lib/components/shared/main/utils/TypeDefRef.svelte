<script lang="ts">
    import type { TsTypeDef } from '@deno/doc';
    import { documentationState } from '$lib/helpers/contexts';
    import { Humanized } from '$lib/helpers/classes/HumanizedNode.svelte';

    let {
        types
    }: {
        types: TsTypeDef|TsTypeDef[];
    } = $props();

    const docs = documentationState.get();
</script>

<span>
    {#each Array.isArray(types) ? types : [types] as type}
        {@const humanized = new Humanized({ documentation: docs.documentation }).humanizeTypeDef(type)}
        <span>
            {#each humanized.tokens as token}
                {@const value = typeof token === 'string' ? token : token.value}
                {@const href = typeof token === 'string' ? undefined : token.href}
                {#if href}
                    <span><a href={href} class="hover:underline text-primary">{value}</a></span>
                {:else}
                    <span>{value}</span>
                {/if}
            {/each}
        </span>
    {/each}
</span>
