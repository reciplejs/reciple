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
    import { HumanizedTypeParams } from '$lib/helpers/classes/humanized/HumanizedTypeParams';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import { Badge } from '$lib/components/ui/badge';
    import { Separator } from '$lib/components/ui/separator';
    import { scrollToWhenActive } from '$lib/helpers/attachments.svelte';

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
                            <TokensCodeBlock tokens={['constructor', ...humanized.tokens]}/>
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
        <DocAccordion
            icon={BoxIcon}
            title="Methods"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each methods as method, index}
                    {@const overloads = node.classDef.methods.filter(m => m.name === method.name)}
                    <div>
                        <OverloadSwitcher data={overloads}>
                            {#snippet children({ item, selectMenu })}
                                {@const slugId = docState.documentation.getElementSlug(item)}
                                {@const humanizedTypeParams = new HumanizedTypeParams(docState).humanize(item.functionDef.typeParams)}
                                {@const humanizedParams = new HumanizedParams(docState).humanize(item.functionDef.params)}
                                <div id={slugId} {@attach scrollToWhenActive(slugId)}>
                                    <h3 class="text-lg text-primary font-bold font-mono flex flex-wrap items-center gap-2 w-full">
                                        {#if item.isAbstract}
                                            <Badge>abstract</Badge>
                                        {/if}
                                        {#if item.isStatic}
                                            <Badge>static</Badge>
                                        {/if}
                                        {#if item.functionDef.isAsync}
                                            <Badge>async</Badge>
                                        {/if}
                                        <a href={`#${slugId}`} class="truncate">{item.name}{method.optional ? '?' : ''}</a>
                                    </h3>
                                </div>
                                <div class={proseClasses}>
                                    <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                                    {#if item.functionDef.typeParams.length || item.functionDef.params.length}
                                        <TokensCodeBlock
                                            tokens={[
                                                item.name,
                                                ...(item.functionDef.typeParams.length ? humanizedTypeParams.tokens : []),
                                                ...humanizedParams.tokens
                                            ]}
                                        />
                                    {/if}
                                    {#if item.functionDef.params.length}
                                        <ParamsTable jsDoc={item.jsDoc} params={item.functionDef.params} class="mt-5"/>
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
                                {#if property.isAbstract}
                                    <Badge>abstract</Badge>
                                {/if}
                                {#if property.isStatic}
                                    <Badge>static</Badge>
                                {/if}
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
