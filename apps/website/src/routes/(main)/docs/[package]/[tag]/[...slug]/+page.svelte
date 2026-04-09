<script lang="ts">
    import { onMount } from 'svelte';
    import { documentationState, searchDialogState } from '$lib/helpers/contexts.js';
    import { page } from '$app/state';
    import ClassPage from '$lib/components/shared/main/docs/ClassPage.svelte';
    import NamespacePage from '$lib/components/shared/main/docs/NamespacePage.svelte';
    import EnumPage from '$lib/components/shared/main/docs/EnumPage.svelte';
    import InterfacePage from '$lib/components/shared/main/docs/InterfacePage.svelte';
    import FunctionPage from '$lib/components/shared/main/docs/FunctionPage.svelte';
    import TypeAliasPage from '$lib/components/shared/main/docs/TypeAliasPage.svelte';
    import VariablePage from '$lib/components/shared/main/docs/VariablePage.svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '$lib/components/shared/main/utils/Markdown.svelte';
    import SearchDialog, { fromSidebarGroups, type SearchData } from '$lib/components/shared/main/SearchDialog.svelte';
    import Fuse from 'fuse.js';

    let { data } = $props();

    let searchState = searchDialogState.get();
    let docState = $derived({ documentation: data.documentation });

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

    // svelte-ignore state_referenced_locally
    documentationState.set(docState);
</script>

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

{#if !page.params.slug || page.params.slug === 'home/readme'}
    <article class={[proseClasses, 'p-4']}>
        <Markdown content={data.documentation.readme}/>
    </article>
{:else}
    {@const node = data.declarations?.[0]}
    {#if node}
        {@const symbol = node.symbol}
        {@const declaration = node.declaration}
        <div class="size-full p-4">
            {#if declaration.kind === 'class'}
                <ClassPage {symbol} {declaration}/>
            {:else if declaration.kind === 'namespace'}
                <NamespacePage {symbol} {declaration}/>
            {:else if declaration.kind === 'enum'}
                <EnumPage {symbol} {declaration}/>
            {:else if declaration.kind === 'interface'}
                <InterfacePage {symbol} {declaration}/>
            {:else if declaration.kind === 'function'}
                <FunctionPage {symbol} declarations={symbol.declarations.filter(d => d.kind === 'function')}/>
            {:else if declaration.kind === 'typeAlias'}
                <TypeAliasPage {symbol} {declaration}/>
            {:else if declaration.kind === 'variable'}
                <VariablePage {symbol} {declaration}/>
            {/if}
        </div>
    {/if}
{/if}
