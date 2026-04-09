<script lang="ts">
    import type { Declaration, Symbol } from '@deno/doc';
    import { DocTypeIcons, proseClasses } from '$lib/helpers/constants';
    import { DocType } from '$lib/helpers/types';
    import { HumanizedNode } from '$lib/helpers/classes/humanized/HumanizedNode';
    import { documentationState } from '$lib/helpers/contexts';
    import DocAccordion from './DocAccordion.svelte';
    import { TextAlignStartIcon } from '@lucide/svelte';
    import Markdown from './Markdown.svelte';
    import TokensCodeBlock from './TokensCodeBlock.svelte';
    import SourceButton from './SourceButton.svelte';

    let {
        symbol,
        declaration,
        removeIcon = false
    }: {
        symbol: Symbol;
        declaration: Declaration;
        removeIcon?: boolean;
    } = $props();

    const docState = documentationState.get();
</script>

<section>
    <div class="grid mb-4">
        <span class:ml-8={!removeIcon} class="text-sm font-normal text-muted-foreground">
            {declaration.kind}
        </span>
        <div class="flex gap-2 items-center overflow-hidden">
            {#if !removeIcon}
                {@const Icon = DocTypeIcons[declaration.kind as DocType]}
                <Icon class="shrink-0"/>
            {/if}
            <h1 class="text-2xl font-bold truncate">
                {symbol.name}
            </h1>
            <SourceButton location={declaration.location}/>
        </div>
    </div>
    <TokensCodeBlock tokens={new HumanizedNode(docState).humanize(symbol, declaration).tokens}/>
    <DocAccordion
        title="Summary"
        icon={TextAlignStartIcon}
        class="mt-4"
    >
        <div class={proseClasses}>
            <Markdown content={declaration.jsDoc?.doc ?? 'No summary provided'}/>
        </div>
    </DocAccordion>
</section>
