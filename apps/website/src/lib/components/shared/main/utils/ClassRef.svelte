<script lang="ts">
    import { documentationState } from '$lib/helpers/contexts';
    import { HumanizedNode } from '$lib/helpers/classes/humanized/HumanizedNode';
    import HumanizedTokens from './HumanizedTokens.svelte';

    let {
        name,
    }: {
        name: string;
    } = $props();

    const docState = documentationState.get();

    let classRef = $derived(docState.documentation.find(name, 'class'));
</script>

{#if classRef}
    <HumanizedTokens tokens={new HumanizedNode(docState).humanize(classRef.symbol, classRef.declaration).tokens}/>
{:else}
    <span>{name}</span>
{/if}
