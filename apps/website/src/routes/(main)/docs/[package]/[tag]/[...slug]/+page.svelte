<script lang="ts">
    import { onMount } from 'svelte';
    import { pageMetadata, searchDialogState } from '$lib/helpers/contexts.js';
    import { page } from '$app/state';
    import MarkdownPage from '$lib/components/shared/main/docs/MarkdownPage.svelte';
    import { MetaTags } from 'svelte-meta-tags';

    let { data } = $props();

    let searchState = searchDialogState.get();
    let documentation = $derived(data.documentation);

    const metadata = pageMetadata.get();

    onMount(() => {
        searchState.open = false;

        metadata.title = data.metadata.title;
        metadata.description = data.metadata.description;
    });
</script>

<MetaTags
    titleTemplate="reciple | %s"
    {...data.metadata}
    openGraph={data.metadata}
    twitter={data.metadata}
/>

{#if page.params.slug === 'home/readme'}
    <MarkdownPage content={documentation.readme}/>
{:else}
{/if}
