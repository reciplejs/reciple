<script lang="ts">
    import type { DocNodeFunction } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeFunction;
    } = $props();
</script>

<DocNodeTitle {node}/>
