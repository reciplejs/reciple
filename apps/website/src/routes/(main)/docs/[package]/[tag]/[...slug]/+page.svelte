<script lang="ts">
    import { onMount } from 'svelte';
    import { searchDialogState } from '$lib/helpers/contexts.js';

    let { data } = $props();

    let searchState = searchDialogState.get();

    onMount(() => {
        searchState.open = false;
    });
</script>
