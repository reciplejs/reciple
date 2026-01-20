<script lang="ts">
    import type { BaseHumanized } from '$lib/helpers/classes/humanized/BaseHumanized';

    let {
        tokens,
        links = true
    }: {
        tokens: BaseHumanized.AnyToken[];
        links?: boolean;
    } = $props();
</script>

<span>
    {#each tokens as token}
        {@const value = typeof token === 'string' ? token : token.value}
        {@const href = typeof token === 'string' ? undefined : token.href}
        {#if href && links}
            <span><a href={href} class="hover:underline text-primary">{value}</a></span>
        {:else}
            <span>{value}</span>
        {/if}
    {/each}
</span>
