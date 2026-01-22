<script lang="ts">
    import type { DocNode, DocNodeFunction, DocNodeNamespace } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { DocTypeIcons } from '../../../../helpers/constants';
    import { DocType } from '../../../../helpers/types';
    import { documentationState } from '../../../../helpers/contexts';
    import ClassPage from './ClassPage.svelte';
    import NamespacePage from './NamespacePage.svelte';
    import EnumPage from './EnumPage.svelte';
    import InterfacePage from './InterfacePage.svelte';
    import FunctionPage from './FunctionPage.svelte';
    import TypeAliasPage from './TypeAliasPage.svelte';
    import VariablePage from './VariablePage.svelte';
    import { filterArrayDuplicate } from '../../../../helpers/utils';

    let {
        node,
        tiny = false
    }: {
        node: DocNodeNamespace;
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();

    let elements: DocNode[] = $derived(
        filterArrayDuplicate(
            node.namespaceDef.elements,
            (data) => data.items.findIndex(item => item.name === data.item.name && item.kind === data.item.kind) === data.index
        )
    );
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
    <TableOfContents {elements}/>
</section>

<section class="mt-2 flex flex-col gap-2">
    {#each elements as element}
        {@const slugId = docState.documentation.getElementSlug(element)}
        <DocAccordion
            open={false}
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
                <FunctionPage tiny nodes={node.namespaceDef.elements.filter(n => n.kind === 'function' && n.name === element.name) as DocNodeFunction[]}/>
            {:else if element?.kind === 'typeAlias'}
                <TypeAliasPage tiny node={element}/>
            {:else if element?.kind === 'variable'}
                <VariablePage tiny node={element}/>
            {/if}
        </DocAccordion>
    {/each}
</section>
