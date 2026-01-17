<script lang="ts">
    import type { DocNodeVariable } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeVariable;
    } = $props();
</script>

<DocNodeTitle {node}/>
