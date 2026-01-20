<script lang="ts">
    import { onMount } from 'svelte';
    import { documentationState, pageMetadata, searchDialogState } from '$lib/helpers/contexts.js';
    import { page } from '$app/state';
    import { MetaTags } from 'svelte-meta-tags';
    import ClassPage from '$lib/components/shared/main/docs/ClassPage.svelte';
    import NamespacePage from '$lib/components/shared/main/docs/NamespacePage.svelte';
    import EnumPage from '$lib/components/shared/main/docs/EnumPage.svelte';
    import InterfacePage from '$lib/components/shared/main/docs/InterfacePage.svelte';
    import FunctionPage from '$lib/components/shared/main/docs/FunctionPage.svelte';
    import TypeAliasPage from '$lib/components/shared/main/docs/TypeAliasPage.svelte';
    import VariablePage from '$lib/components/shared/main/docs/VariablePage.svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '$lib/components/shared/main/utils/Markdown.svelte';

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
    <article class={[proseClasses, 'p-4']}>
        <Markdown content={data.documentation.readme}/>
    </article>
{:else}
    {@const node = data.nodes?.[0]}
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
            <FunctionPage nodes={data.nodes!.filter(n => n.kind === 'function')}/>
        {:else if node?.kind === 'typeAlias'}
            <TypeAliasPage {node}/>
        {:else if node?.kind === 'variable'}
            <VariablePage {node}/>
        {/if}
    </div>
{/if}
