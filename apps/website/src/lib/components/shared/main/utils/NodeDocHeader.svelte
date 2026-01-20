<script lang="ts">
    import type { DocNode } from '@deno/doc';
    import { DocTypeIcons, proseClasses } from '$lib/helpers/constants';
    import { DocType } from '$lib/helpers/types';
    import { HumanizedNode } from '$lib/helpers/classes/humanized/HumanizedNode';
    import { documentationState } from '$lib/helpers/contexts';
    import DocAccordion from './DocAccordion.svelte';
    import { TextAlignStartIcon } from '@lucide/svelte';
    import Markdown from './Markdown.svelte';
    import TokensCodeBlock from './TokensCodeBlock.svelte';

    let {
        node
    }: {
        node: DocNode;
    } = $props();

    const docState = documentationState.get();

    let Icon = $derived(DocTypeIcons[node.kind as DocType]);
</script>

<section class="grid">
    <div class="grid mb-4">
        <span class="ml-8 text-sm font-normal text-muted-foreground">{node.kind}</span>
        <div class="flex gap-2 items-center overflow-hidden">
            <Icon class="shrink-0"/>
            <h1 class="text-2xl font-bold truncate">{node.name}</h1>
        </div>
    </div>
    <TokensCodeBlock tokens={new HumanizedNode(docState).humanize(node).tokens}/>
    <DocAccordion
        open
        title="Summary"
        icon={TextAlignStartIcon}
        class="mt-4"
    >
        <div class={proseClasses}>
            <Markdown content={node.jsDoc?.doc ?? 'No summary provided'}/>
        </div>
    </DocAccordion>
</section>
