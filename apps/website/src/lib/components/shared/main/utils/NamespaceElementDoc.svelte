<script lang="ts">
    import type { Declaration, Symbol } from '@deno/doc';
    import DocAccordion from './DocAccordion.svelte';
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
        symbol,
        declaration,
        open = $bindable(false),
    }: {
        symbol: Symbol;
        declaration: Declaration;
        open?: boolean;
    } = $props();

    const docState = documentationState.get();

    let slugId = $derived(docState.documentation.getElementSlug(symbol.name, declaration));
</script>

<DocAccordion
    bind:open
    icon={DocTypeIcons[declaration.kind as DocType]}
    title={symbol.name}
    id={slugId}
>
    {#if declaration?.kind === 'class'}
        <ClassPage tiny {symbol} {declaration}/>
    {:else if declaration?.kind === 'namespace'}
        <NamespacePage tiny {symbol} {declaration}/>
    {:else if declaration?.kind === 'enum'}
        <EnumPage tiny {symbol} {declaration}/>
    {:else if declaration?.kind === 'interface'}
        <InterfacePage tiny {symbol} {declaration}/>
    {:else if declaration?.kind === 'function'}
        <FunctionPage
            tiny
            {symbol}
            declarations={symbol.declarations.filter(n => n.kind === 'function')}
        />
    {:else if declaration?.kind === 'typeAlias'}
        <TypeAliasPage tiny {symbol} {declaration}/>
    {:else if declaration?.kind === 'variable'}
        <VariablePage tiny {symbol} {declaration}/>
    {/if}
</DocAccordion>
