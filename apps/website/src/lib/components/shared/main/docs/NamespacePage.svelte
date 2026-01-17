<script lang="ts">
    import type { DocNodeNamespace } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeNamespace;
    } = $props();
</script>

<DocNodeTitle {node}/>
