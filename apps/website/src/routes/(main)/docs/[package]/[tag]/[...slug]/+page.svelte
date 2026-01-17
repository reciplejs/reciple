<script lang="ts">
    import { onMount } from 'svelte';
    import { documentationState, pageMetadata, searchDialogState } from '$lib/helpers/contexts.js';
    import { page } from '$app/state';
    import MarkdownPage from '$lib/components/shared/main/docs/MarkdownPage.svelte';
    import { MetaTags } from 'svelte-meta-tags';
    import type { DocNodeKind } from '@deno/doc';
    import ClassPage from '$lib/components/shared/main/docs/ClassPage.svelte';
    import NamespacePage from '$lib/components/shared/main/docs/NamespacePage.svelte';
    import EnumPage from '$lib/components/shared/main/docs/EnumPage.svelte';
    import InterfacePage from '$lib/components/shared/main/docs/InterfacePage.svelte';
    import FunctionPage from '$lib/components/shared/main/docs/FunctionPage.svelte';
    import TypeAliasPage from '$lib/components/shared/main/docs/TypeAliasPage.svelte';
    import VariablePage from '$lib/components/shared/main/docs/VariablePage.svelte';

    let { data } = $props();

    let searchState = searchDialogState.get();
    let documentation = $derived(data.documentation);
    let docState = $derived({ documentation });

    const metadata = pageMetadata.get();

    onMount(() => {
        searchState.open = false;
    });

    $effect(() => {
        metadata.title = data.metadata.title;
        metadata.description = data.metadata.description;
        metadata.keywords = data.metadata.keywords;
    });

    documentationState.set(docState);
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
    {@const node = documentation.data.find(node => node.kind === type && node.name === name)}

    <div class="size-full p-4">
        {#if node?.kind === 'class'}
            <ClassPage {node}/>
        {:else if node?.kind === 'namespace'}
            <NamespacePage {node}/>
        {:else if node?.kind === 'enum'}
            <EnumPage {node}/>
        {:else if node?.kind === 'interface'}
            <InterfacePage {node}/>
        {:else if node?.kind === 'function'}
            <FunctionPage {node}/>
        {:else if node?.kind === 'typeAlias'}
            <TypeAliasPage {node}/>
        {:else if node?.kind === 'variable'}
            <VariablePage {node}/>
        {/if}
    </div>
{/if}
