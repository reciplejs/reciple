<script lang="ts">
    import type { DeclarationNamespace, Symbol } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import ElementDoc from '../utils/NamespaceElementDoc.svelte';
    import { filterArrayDuplicate } from '../../../../helpers/utils';

    let {
        symbol,
        declaration,
        tiny = false
    }: {
        symbol: Symbol;
        declaration: DeclarationNamespace;
        tiny?: boolean;
    } = $props();

    let symbols: Symbol[] = $derived(declaration.def.elements);
</script>

<section class="mt-2 flex flex-col gap-2">
    <NodeDocHeader {symbol} {declaration} removeIcon={tiny}/>
    <TableOfContents elements={symbols} open={!tiny}/>
</section>

<section class="mt-2 flex flex-col gap-2">
    {#each symbols as symbol}
        {@const declarations = filterArrayDuplicate(symbol.declarations, 'kind')}
        {#each declarations as declaration}
            <ElementDoc {symbol} {declaration}/>
        {/each}
    {/each}
</section>
