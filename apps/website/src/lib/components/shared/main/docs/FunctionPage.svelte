<script lang="ts">
    import type { DocNodeFunction } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';
    import TypeDefRef from '../utils/TypeDefRef.svelte';

    let {
        node
    }: {
        node: DocNodeFunction;
    } = $props();
</script>

<DocNodeTitle {node}/>

<TypeDefRef types={[node.functionDef.returnType!]}/>
