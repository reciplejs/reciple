<script lang="ts">
    import type { DeclarationClass, Symbol } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon, WrenchIcon } from '@lucide/svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { HumanizedParams } from '$lib/helpers/classes/humanized/HumanizedParams';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import OverloadSwitcher from '../utils/OverloadSwitcher.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import MethodDoc from '../utils/MethodDoc.svelte';
    import PropertyDoc from '../utils/PropertyDoc.svelte';
    import { filterArrayDuplicate } from '../../../../helpers/utils';

    let {
        symbol,
        declaration,
        tiny = false
    }: {
        symbol: Symbol;
        declaration: DeclarationClass;
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();

    let methods = $derived(filterArrayDuplicate(declaration.def.methods ?? [], 'name'));
    let properties  = $derived(filterArrayDuplicate(declaration.def.properties ?? [], 'name'));
</script>

<NodeDocHeader {symbol} {declaration} removeIcon={tiny}/>

<section class="mt-2 flex flex-col gap-2">
    {#if declaration.def.constructors}
        <DocAccordion
            open={!tiny}
            icon={BoxIcon}
            title="Constructor"
        >
            <OverloadSwitcher data={declaration.def.constructors}>
                {#snippet children({ item })}
                    <div class={proseClasses}>
                        <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                        {#if item.params.length}
                            {@const humanized = new HumanizedParams(docState).humanize(item.params)}
                            <TokensCodeBlock tokens={['constructor', ...humanized.tokens]}/>
                            <ParamsTable jsDoc={item.jsDoc} params={item.params} class="mt-5"/>
                        {/if}
                    </div>
                {/snippet}
            </OverloadSwitcher>
        </DocAccordion>
    {/if}
    <TableOfContents {methods} {properties}/>
</section>
{#if methods.length}
    <section class="mt-2">
        <DocAccordion
            open={!tiny}
            icon={BoxIcon}
            title="Methods"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each methods as method, index}
                    {@const overloads = declaration.def.methods?.filter(m => m.name === method.name)}
                    {#if overloads?.length}
                        <MethodDoc {overloads} addSeparator={index !== methods.length - 1}/>
                    {/if}
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
{#if properties.length}
    <section class="mt-2">
        <DocAccordion
            open={!tiny}
            icon={WrenchIcon}
            title="Properties"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each properties as property, index}
                    <PropertyDoc item={property} addSeparator={index !== properties.length - 1}/>
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
