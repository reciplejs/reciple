<script lang="ts">
    import { documentationState } from '$lib/helpers/contexts';
    import { Humanized } from '$lib/helpers/classes/HumanizedNode.svelte';

    let {
        name,
    }: {
        name: string;
    } = $props();

    const docState = documentationState.get();

    let classRef = $derived(docState.documentation.classes.find(node => node.name === name));
</script>

{#if classRef}
    {@const humanized = new Humanized({ documentation: docState.documentation }).humanizeNode(classRef)}
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
{:else}
    <span>{name}</span>
{/if}
