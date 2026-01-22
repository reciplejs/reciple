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
        {@const external = typeof token === 'string' ? undefined : token.external}
        {#if href && links}
            <span>
                <a href={href} title={href} class="hover:underline text-primary">{value}</a>
            </span>
        {:else}
            <span>{value}</span>
        {/if}
    {/each}
</span>
