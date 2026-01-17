<script lang="ts">
    import { onMount } from 'svelte';
    import { pageMetadata, searchDialogState } from '$lib/helpers/contexts.js';
    import { page } from '$app/state';
    import MarkdownPage from '$lib/components/shared/main/docs/MarkdownPage.svelte';
    import { MetaTags } from 'svelte-meta-tags';
    import type { DocNodeKind } from '@deno/doc';

    let { data } = $props();

    let searchState = searchDialogState.get();
    let documentation = $derived(data.documentation);

    const metadata = pageMetadata.get();

    onMount(() => {
        searchState.open = false;
    });

    $effect(() => {
        metadata.title = data.metadata.title;
        metadata.description = data.metadata.description;
        metadata.keywords = data.metadata.keywords;
    })
</script>

<MetaTags
    titleTemplate="reciple | %s"
    {...data.metadata}
    openGraph={data.metadata}
    twitter={data.metadata}
/>

{#if !page.params.slug || page.params.slug === 'home/readme'}
    <MarkdownPage content={documentation.readme}/>
{:else}
    {@const type = page.params.slug.split('/')[0] as DocNodeKind}
    {@const name = page.params.slug.split('/')[1]}
    {@const symbol = documentation.data.find(node => node.kind === type && node.name === name)}
    {@debug symbol}

    <h1>{symbol?.name}</h1>
{/if}
