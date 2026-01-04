<script lang="ts">
    import '$lib/styles/markdown.css';
    import { pageMetadata, searchDialogState } from '$lib/helpers/contexts.js';
    import { MetaTags } from 'svelte-meta-tags';
    import SearchDialog, { type SearchData } from '$lib/components/shared/main/SearchDialog.svelte';
    import type { SidebarData } from '$lib/helpers/types.js';
    import Pagination from '$lib/components/shared/main/guide/Pagination.svelte';
    import Fuse from 'fuse.js';
    import { onMount } from 'svelte';

    let { data } = $props();

    let metadata = pageMetadata.get();
    let searchState = searchDialogState.get();

    $effect(() => {
        metadata.title = data.metadata?.title;
        metadata.description = data.metadata?.description;
    });

    let searchIndex: SearchData[] = $derived(toSearchData(data.sidebarData.content?.groups ?? []));
    let fuse: Fuse<SearchData> = $derived(new Fuse(searchIndex, {
        keys: [
            { name: 'title', weight: 0.8 },
            { name: 'keywords', weight: 0.5 },
            { name: 'description', weight: 0.3 },
            { name: 'category', weight: 0.1 },
        ],
        threshold: 0.3
    }));

    function toSearchData(groups: SidebarData.Group[]): SearchData[] {
        const data: SearchData[] = [];

        for (const group of groups) {
            for (const [category, categoryData] of Object.entries(group.categories)) {
                for (const link of categoryData.links) {
                    data.push({
                        title: link.label,
                        description: link.metadata?.description,
                        keywords: link.metadata?.keywords,
                        href: link.href,
                        category,
                        icon: link.icon
                    });
                }
            }
        }

        return data;
    }

    onMount(() => {
        searchState.open = false;
    });
</script>

<MetaTags titleTemplate="reciple | %s" {...data.metadata}/>

{#if searchState.open !== undefined}
    <SearchDialog
        bind:open={searchState.open}
        data={searchIndex}
        onFilter={async (value) => {
            value = value.trim();
            if (!value) return searchIndex;

            const results = fuse.search(value);

            return results.map(result => result.item);
        }}
    />
{/if}

<article
    class={[
        "prose prose-neutral prose-sm @3xl:prose-base dark:prose-invert max-w-none p-4",
        "prose-code:after:content-none prose-code:before:content-none prose-code:bg-foreground/15 prose-code:py-0.5 prose-code:px-1 prose-code:rounded-md",
        "prose-pre:prose-code:rounded-none prose-pre:prose-code:p-0 prose-pre:prose-code:bg-transparent prose-pre:leading-tight",
        "prose-blockquote:prose-p:before:content-none prose-blockquote:prose-p:after:content-none",
        "prose-a:text-primary dark:prose-a:text-blue-400 prose-a:no-underline"
    ]}
>
    <data.component/>
</article>
<Pagination/>

