<script lang="ts">
    import type { DocNodeInterface } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import { documentationState } from '../../../../helpers/contexts';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon, WrenchIcon } from '@lucide/svelte';
    import OverloadSwitcher from '../utils/OverloadSwitcher.svelte';
    import { HumanizedTypeParams } from '../../../../helpers/classes/humanized/HumanizedTypeParams';
    import { HumanizedParams } from '../../../../helpers/classes/humanized/HumanizedParams';
    import { scrollToWhenActive } from '../../../../helpers/attachments.svelte';
    import { Badge } from '../../../ui/badge';
    import { proseClasses } from '../../../../helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import { HumanizedTypeDef } from '../../../../helpers/classes/humanized/HumanizedTypeDef';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { Separator } from '../../../ui/separator';
    import { filterArrayDuplicate } from '../../../../helpers/utils';

    let {
        node
    }: {
        node: DocNodeInterface;
    } = $props();

    const docState = documentationState.get();

    let methods = $derived(filterArrayDuplicate(node.interfaceDef.methods, 'name'));
    let properties = $derived(filterArrayDuplicate(node.interfaceDef.properties, 'name'));
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
    <TableOfContents {methods} {properties}/>
</section>
{#if methods.length}
    <section class="mt-2">
        <DocAccordion
            icon={BoxIcon}
            title="Methods"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each methods as method, index}
                    {@const overloads = node.interfaceDef.methods.filter(m => m.name === method.name)}
                    <div>
                        <OverloadSwitcher data={overloads}>
                            {#snippet children({ item, selectMenu })}
                                {@const slugId = docState.documentation.getElementSlug(item)}
                                {@const humanizedTypeParams = new HumanizedTypeParams(docState).humanize(item.typeParams)}
                                {@const humanizedParams = new HumanizedParams(docState).humanize(item.params)}
                                <div id={slugId} {@attach scrollToWhenActive(slugId)}>
                                    <h3 class="text-lg text-primary font-bold font-mono flex flex-wrap items-center gap-2 w-full">
                                        <a href={`#${slugId}`} class="truncate">{item.name}{method.optional ? '?' : ''}</a>
                                    </h3>
                                </div>
                                <div class={proseClasses}>
                                    <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                                    <TokensCodeBlock
                                        tokens={[
                                            item.name,
                                            ...(item.typeParams.length ? humanizedTypeParams.tokens : []),
                                            ...humanizedParams.tokens,
                                            ...(item.returnType
                                                ? [':', ' ', ...new HumanizedTypeDef(docState).humanize(item.returnType).tokens]
                                                : []
                                            )
                                        ]}
                                    />
                                    {#if item.params.length}
                                        <ParamsTable jsDoc={item.jsDoc} params={item.params} class="mt-5"/>
                                    {/if}
                                    {#if item.returnType}
                                        <div>
                                            <p class="text-muted-foreground text-sm mt-2!">
                                                <b>Returns:</b>
                                                <TokensCodeBlock
                                                    class="inline-block p-0 border-0"
                                                    tokens={new HumanizedTypeDef(docState).humanize(item.returnType).tokens}
                                                />
                                            </p>
                                        </div>
                                    {/if}
                                    {#if overloads.length > 1}
                                        {@render selectMenu({ class: 'pb-5' })}
                                    {/if}
                                </div>
                            {/snippet}
                        </OverloadSwitcher>
                        {#if index < methods.length - 1}
                            <Separator/>
                        {/if}
                    </div>
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
{#if properties.length}
    <section class="mt-2">
        <DocAccordion
            icon={WrenchIcon}
            title="Properties"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each properties as property}
                    {@const slugId = docState.documentation.getElementSlug(property)}
                    <div>
                        <div id={slugId} {@attach scrollToWhenActive(slugId)}>
                            <h3 class="text-lg text-primary font-bold font-mono flex flex-wrap items-center gap-2 w-full">
                                {#if property.readonly}
                                    <Badge>readonly</Badge>
                                {/if}
                                <a href={`#${slugId}`} class="truncate">{property.name}{property.optional ? '?' : ''}</a>
                            </h3>
                        </div>
                        <div class={proseClasses}>
                            <Markdown content={property.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                            {#if property.tsType}
                                <TokensCodeBlock tokens={new HumanizedTypeDef(docState).humanize(property.tsType).tokens}/>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
