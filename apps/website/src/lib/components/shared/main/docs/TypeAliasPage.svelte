<script lang="ts">
    import type { DocNodeTypeAlias } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeTypeAlias;
    } = $props();
</script>

<NodeDocHeader {node}/>
