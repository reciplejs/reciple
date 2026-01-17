<script lang="ts">
    import type { DocNodeTypeAlias } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeTypeAlias;
    } = $props();
</script>

<DocNodeTitle {node}/>
