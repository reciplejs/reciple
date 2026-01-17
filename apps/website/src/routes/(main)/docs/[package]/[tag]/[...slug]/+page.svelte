<script lang="ts">
    import { onMount } from 'svelte';
    import { searchDialogState } from '$lib/helpers/contexts.js';
    import { page } from '$app/state';
    import MarkdownPage from '$lib/components/shared/main/docs/MarkdownPage.svelte';

    let { data } = $props();

    let searchState = searchDialogState.get();
    let documentation = $derived(data.documentation);

    onMount(() => {
        searchState.open = false;
    });
</script>

{#if page.params.slug === 'home/readme'}
    <MarkdownPage content={documentation.readme}/>
{:else}
{/if}
