<script lang="ts">
    import type { DocNodeEnum } from '@deno/doc';
    import DocNodeTitle from '../utils/DocNodeTitle.svelte';

    let {
        node
    }: {
        node: DocNodeEnum;
    } = $props();
</script>

<DocNodeTitle {node}/>
