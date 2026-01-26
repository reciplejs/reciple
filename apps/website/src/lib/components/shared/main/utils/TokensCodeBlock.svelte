<script lang="ts">
    import { BaseHumanized } from '$lib/helpers/classes/humanized/BaseHumanized';
    import type { BundledLanguage, SpecialLanguage, ThemedTokenWithVariants } from 'shiki';
    import { cn, highlighter, themes } from '$lib/helpers/utils';
    import HumanizedTokens from './HumanizedTokens.svelte';
    import type { ClassValue, HTMLAttributes } from 'svelte/elements';
    import { mode } from 'mode-watcher';

    let {
        tokens,
        lang,
        links = true,
        ...props
    }: {
        tokens: BaseHumanized.AnyToken[];
        lang?: BundledLanguage|SpecialLanguage;
        links?: boolean;
    } & HTMLAttributes<HTMLDivElement> = $props();

    let highlighted = $derived(highlighter.codeToTokensWithThemes(BaseHumanized.stringifyTokens(tokens), {
        themes,
        lang: lang ?? 'typescript'
    }));

    const commonClasses: ClassValue = [
        "top-0 left-0 whitespace-normal w-full"
    ];
</script>

{#snippet HighlightedTokens(htokens: ThemedTokenWithVariants[][])}
    {#each htokens as token}
        {#each token as t}
            {@const variant = t.variants[mode.current ?? 'light']}
            <span
                {...variant.htmlAttrs}
                style="--color: {variant.color}; --background-color: {variant.bgColor};"
                class="text-(--color)"
            >{t.content}</span>
        {/each}
    {/each}
{/snippet}

<div {...props} class={cn(["px-4 py-2 text-sm border border-foreground/15 rounded not-prose", props.class])}>
    <div class="relative">
        {#if links}
            <pre class={["relative z-10 opacity-0", commonClasses]} style="word-wrap: break-word;"><code><HumanizedTokens {tokens}/></code></pre>
        {/if}
        <pre class={[links ? "absolute" : "relative", "pointer-events-none", commonClasses]} style="word-wrap: break-word;"><code>{@render HighlightedTokens(highlighted)}</code></pre>
    </div>
</div>
