<script lang="ts">
    import type { DeclarationInterface, Symbol } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon, WrenchIcon } from '@lucide/svelte';
    import { filterArrayDuplicate } from '$lib/helpers/utils';
    import MethodDoc from '../utils/MethodDoc.svelte';
    import PropertyDoc from '../utils/PropertyDoc.svelte';

    let {
        symbol,
        declaration,
        tiny = false
    }: {
        symbol: Symbol;
        declaration: DeclarationInterface;
        tiny?: boolean;
    } = $props();

    let methods = $derived(filterArrayDuplicate(declaration.def.methods ?? [], 'name'));
    let properties = $derived(filterArrayDuplicate(declaration.def.properties ?? [], 'name'));
</script>

<section class="mt-2 flex flex-col gap-2">
    <NodeDocHeader {symbol} {declaration} removeIcon={tiny}/>
    <TableOfContents {methods} {properties} open={!tiny}/>
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
                    {#if overloads}
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
