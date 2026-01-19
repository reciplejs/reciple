<script lang="ts">
    import type { TsTypeDef } from '@deno/doc';
    import { documentationState } from '$lib/helpers/contexts';
    import HumanizedTokens from './HumanizedTokens.svelte';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';

    let {
        types
    }: {
        types: TsTypeDef|TsTypeDef[];
    } = $props();

    const docState = documentationState.get();
</script>

<span>
    {#each Array.isArray(types) ? types : [types] as type}
        {@const humanized = new HumanizedTypeDef(docState).humanize(type)}
        <HumanizedTokens tokens={humanized.tokens}/>
    {/each}
</span>
