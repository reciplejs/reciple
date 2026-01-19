<script lang="ts">
    import type { DocNode } from '@deno/doc';
    import { DocTypeIcons } from '$lib/helpers/constants';
    import { DocType } from '$lib/helpers/types';
    import ClassRef from './ClassRef.svelte';
    import TypeDefRef from './TypeDefRef.svelte';
    import HumanizedTokens from './HumanizedTokens.svelte';
    import { HumanizedNode } from '$lib/helpers/classes/humanized/HumanizedNode';
    import { documentationState } from '$lib/helpers/contexts';

    let {
        node
    }: {
        node: DocNode;
    } = $props();

    const docState = documentationState.get();

    let Icon = $derived(DocTypeIcons[node.kind as DocType]);
</script>

<div class="grid mb-4">
    <p class="ml-8 text-sm font-normal text-muted-foreground">{node.kind}</p>
    <div class="flex gap-2 items-center overflow-hidden">
        <Icon class="shrink-0"/>
        <h1 class="text-2xl font-bold truncate">{node.name}</h1>
    </div>
    <p class="ml-8 text-xs font-normal text-muted-foreground">
        {#if node.kind === 'class' && node.classDef.extends}
            extends <ClassRef name={node.classDef.extends}/>
        {:else if node.kind === 'interface' && node.interfaceDef.extends.length}
            extends <TypeDefRef types={node.interfaceDef.extends}/>
        {/if}
        {#if node.kind === 'class' && node.classDef.implements.length}
            implements <TypeDefRef types={node.classDef.implements}/>
        {/if}
    </p>
</div>

<pre class="border border-foreground/15 rounded px-4 py-2 whitespace-normal" style="word-wrap: break-word;"><code><HumanizedTokens tokens={new HumanizedNode(docState).humanize(node).tokens}/></code></pre>

