<script lang="ts">
    import type { DocNode, DocNodeFunction, DocNodeNamespace } from '@deno/doc';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import ClassPage from '../docs/ClassPage.svelte';
    import NamespacePage from '../docs/NamespacePage.svelte';
    import EnumPage from '../docs/EnumPage.svelte';
    import InterfacePage from '../docs/InterfacePage.svelte';
    import FunctionPage from '../docs/FunctionPage.svelte';
    import TypeAliasPage from '../docs/TypeAliasPage.svelte';
    import VariablePage from '../docs/VariablePage.svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import { DocTypeIcons } from '$lib/helpers/constants';
    import { DocType } from '$lib/helpers/types';

    let {
        element,
        namespace,
        open = $bindable(false),
    }: {
        element: DocNode;
        namespace: DocNodeNamespace;
        open?: boolean;
    } = $props();

    const docState = documentationState.get();

    let slugId = $derived(docState.documentation.getElementSlug(element));
</script>

<DocAccordion
    bind:open
    icon={DocTypeIcons[element.kind as DocType]}
    title={element.name}
    id={slugId}
>
    {#if element?.kind === 'class'}
        <ClassPage tiny node={element}/>
    {:else if element?.kind === 'namespace'}
        <NamespacePage tiny node={element}/>
    {:else if element?.kind === 'enum'}
        <EnumPage tiny node={element}/>
    {:else if element?.kind === 'interface'}
        <InterfacePage tiny node={element}/>
    {:else if element?.kind === 'function'}
        <FunctionPage tiny nodes={namespace.namespaceDef.elements.filter(n => n.kind === 'function' && n.name === element.name) as DocNodeFunction[]}/>
    {:else if element?.kind === 'typeAlias'}
        <TypeAliasPage tiny node={element}/>
    {:else if element?.kind === 'variable'}
        <VariablePage tiny node={element}/>
    {/if}
</DocAccordion>
