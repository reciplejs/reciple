<script lang="ts">
    import type { DocNodeInterface } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon, WrenchIcon } from '@lucide/svelte';
    import { filterArrayDuplicate } from '$lib/helpers/utils';
    import MethodDoc from '../utils/MethodDoc.svelte';
    import PropertyDoc from '../utils/PropertyDoc.svelte';

    let {
        node,
        tiny = false
    }: {
        node: DocNodeInterface;
        tiny?: boolean;
    } = $props();

    let methods = $derived(filterArrayDuplicate(node.interfaceDef.methods, 'name'));
    let properties = $derived(filterArrayDuplicate(node.interfaceDef.properties, 'name'));
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
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
                    {@const overloads = node.interfaceDef.methods.filter(m => m.name === method.name)}
                    <MethodDoc {overloads} addSeparator={index !== methods.length - 1}/>
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
