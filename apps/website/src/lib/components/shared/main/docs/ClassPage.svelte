<script lang="ts">
    import type { DocNodeClass } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeClass;
    } = $props();
</script>

<DocNodeTitle {node}/>
