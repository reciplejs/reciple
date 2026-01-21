<script lang="ts">
    import type { DocNodeClass } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon } from '@lucide/svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { HumanizedParams } from '$lib/helpers/classes/humanized/HumanizedParams';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import OverloadSwitcher from '../utils/OverloadSwitcher.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import { filterArrayDuplicate } from '../../../../helpers/utils';
    import { HumanizedTypeParams } from '../../../../helpers/classes/humanized/HumanizedTypeParams';
    import { HumanizedTypeDef } from '../../../../helpers/classes/humanized/HumanizedTypeDef';
    import { Separator } from '../../../ui/separator';

    let {
        node
    }: {
        node: DocNodeClass;
    } = $props();

    const docState = documentationState.get();

    let methods = $derived(filterArrayDuplicate(node.classDef.methods, 'name'));
    let properties  = $derived(filterArrayDuplicate(node.classDef.properties, 'name'));
</script>

<NodeDocHeader {node}/>

<section class="mt-2 grid gap-2">
    {#if node.classDef.constructors.length}
        <DocAccordion
            icon={BoxIcon}
            title="Constructor"
        >
            <OverloadSwitcher data={node.classDef.constructors}>
                {#snippet children({ item })}
                    <div class={proseClasses}>
                        <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                        {#if item.params.length}
                            {@const humanized = new HumanizedParams(docState).humanize(item.params)}
                            <TokensCodeBlock tokens={humanized.tokens}/>
                            <ParamsTable params={item.params} class="mt-5"/>
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
        <h1 class="flex items-center gap-2 font-semibold text-lg px-2 py-4">
            <BoxIcon/>
            Methods
        </h1>
        <div class="grid gap-5 px-2 mt-3">
            {#each methods as method, index}
                {@const overloads = node.classDef.methods.filter(m => m.name === method.name)}
                <div>
                    <OverloadSwitcher data={overloads}>
                        {#snippet children({ item })}
                            {@const slugId = docState.documentation.getElementSlug(item)}
                            {@const humanizedTypeParams = new HumanizedTypeParams(docState).humanize(item.functionDef.typeParams)}
                            {@const humanizedParams = new HumanizedParams(docState).humanize(item.functionDef.params)}
                            <div class={proseClasses} id={slugId}>
                                <h2 class="text-semibold truncate">
                                    <a href={`#${slugId}`}>{item.name}</a>
                                </h2>
                                <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                                {#if item.functionDef.typeParams.length || item.functionDef.params.length}
                                    <TokensCodeBlock
                                        tokens={[
                                            ...(item.functionDef.typeParams.length ? humanizedTypeParams.tokens : []),
                                            ...humanizedParams.tokens
                                        ]}
                                    />
                                {/if}
                                {#if item.functionDef.params.length}
                                    <ParamsTable params={item.functionDef.params} class="mt-5"/>
                                {/if}
                                {#if item.functionDef.returnType}
                                    <div>
                                        <p class="text-muted-foreground text-sm mt-2!">
                                            <b>Returns:</b>
                                            <TokensCodeBlock
                                                class="inline-block p-0 border-0"
                                                tokens={new HumanizedTypeDef(docState).humanize(item.functionDef.returnType).tokens}
                                            />
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        {/snippet}
                    </OverloadSwitcher>
                    {#if index < overloads.length - 1}
                        <Separator class="mt-5"/>
                    {/if}
                </div>
            {/each}
        </div>
    </section>
{/if}
