<script lang="ts">
    import type { DocNodeEnum } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';

    let {
        node
    }: {
        node: DocNodeEnum;
    } = $props();
</script>

<NodeDocHeader {node}/>
