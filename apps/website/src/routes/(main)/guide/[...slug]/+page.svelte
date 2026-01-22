<script lang="ts">
    import '$lib/styles/markdown.css';
    import { pageMetadata, searchDialogState } from '$lib/helpers/contexts.js';
    import { MetaTags } from 'svelte-meta-tags';
    import SearchDialog, { fromSidebarGroups, type SearchData } from '$lib/components/shared/main/SearchDialog.svelte';
    import Pagination from '$lib/components/shared/main/guide/Pagination.svelte';
    import Fuse from 'fuse.js';
    import { onMount } from 'svelte';
    import { proseClasses } from '$lib/helpers/constants.js';

    let { data } = $props();

    let metadata = pageMetadata.get();
    let searchState = searchDialogState.get();

    $effect(() => {
        metadata.title = data.metadata?.title;
        metadata.description = data.metadata?.description;
    });

    let searchIndex: SearchData[] = $derived(fromSidebarGroups(data.sidebarData.content?.groups ?? []));
    let fuse: Fuse<SearchData> = $derived(new Fuse(searchIndex, {
        keys: [
            { name: 'title', weight: 0.8 },
            { name: 'keywords', weight: 0.5 },
            { name: 'description', weight: 0.3 },
            { name: 'category', weight: 0.1 },
        ],
        threshold: 0.3
    }));

    onMount(() => {
        searchState.open = false;
    });
</script>

<svelte:head>
    <MetaTags
        titleTemplate="reciple | %s"
        {...data.metadata}
        openGraph={data.metadata}
        twitter={data.metadata}
    />
</svelte:head>

{#if searchState.open !== undefined}
    <SearchDialog
        bind:open={searchState.open}
        data={searchIndex}
        delayType={null}
        onFilter={async (value) => {
            value = value.trim();
            if (!value) return searchIndex;

            const results = fuse.search(value);

            return results.map(result => result.item);
        }}
    />
{/if}

<article class={[proseClasses, 'p-4']}>
    <data.component/>
</article>
<Pagination/>

