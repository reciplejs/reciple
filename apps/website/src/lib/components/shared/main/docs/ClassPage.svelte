<script lang="ts">
    import type { DocNodeClass } from '@deno/doc';
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
    import { filterArrayDuplicate } from '$lib/helpers/utils';
    import MethodDoc from '../utils/MethodDoc.svelte';
    import PropertyDoc from '../utils/PropertyDoc.svelte';

    let {
        node,
        tiny = false
    }: {
        node: DocNodeClass;
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();

    let methods = $derived(filterArrayDuplicate(node.classDef.methods, 'name'));
    let properties  = $derived(filterArrayDuplicate(node.classDef.properties, 'name'));
</script>

<NodeDocHeader {node}/>

<section class="mt-2 grid gap-2">
    {#if node.classDef.constructors.length}
        <DocAccordion
            open={!tiny}
            icon={BoxIcon}
            title="Constructor"
        >
            <OverloadSwitcher data={node.classDef.constructors}>
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
                    {@const overloads = node.classDef.methods.filter(m => m.name === method.name)}
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
