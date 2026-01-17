<script lang="ts">
    import type { DocNodeInterface } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeInterface;
    } = $props();
</script>

<DocNodeTitle {node}/>
