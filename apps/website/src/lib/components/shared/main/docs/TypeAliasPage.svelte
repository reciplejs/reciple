<script lang="ts">
    import type { DeclarationTypeAlias, Symbol } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        symbol,
        declaration,
        tiny = false
    }: {
        symbol: Symbol;
        declaration: DeclarationTypeAlias;
        tiny?: boolean;
    } = $props();
</script>

<section class="mt-2">
    <NodeDocHeader {symbol} {declaration} removeIcon={tiny}/>
</section>
