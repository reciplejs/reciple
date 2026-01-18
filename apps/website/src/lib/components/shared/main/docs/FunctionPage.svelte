<script lang="ts">
    import type { DocNodeFunction } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';
    import TypeDef from '../utils/TypeDef.svelte';

    let {
        node
    }: {
        node: DocNodeFunction;
    } = $props();
</script>

<DocNodeTitle {node}/>

<TypeDef types={[node.functionDef.returnType!]}/>
