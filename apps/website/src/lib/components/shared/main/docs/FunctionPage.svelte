<script lang="ts">
    import type { DocNodeFunction } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TypeDefRef from '../utils/TypeDefRef.svelte';

    let {
        node
    }: {
        node: DocNodeFunction;
    } = $props();
</script>

<NodeDocHeader {node}/>

<TypeDefRef types={[node.functionDef.returnType!]}/>
