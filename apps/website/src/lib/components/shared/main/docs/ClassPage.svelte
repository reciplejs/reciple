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
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
    import CardFooter from '../../../ui/card/card-footer.svelte';
    import { Badge } from '../../../ui/badge';

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
        <DocAccordion
            icon={BoxIcon}
            title="Methods"
            contentClass="border-b-0 px-0!"
        >
            <div class="grid gap-2">
                {#each methods as method}
                    {@const overloads = node.classDef.methods.filter(m => m.name === method.name)}
                    <Card class="bg-card border-border/70 shadow-none">
                        <OverloadSwitcher data={overloads}>
                            {#snippet children({ item })}
                                {@const slugId = docState.documentation.getElementSlug(item)}
                                {@const humanizedTypeParams = new HumanizedTypeParams(docState).humanize(item.functionDef.typeParams)}
                                {@const humanizedParams = new HumanizedParams(docState).humanize(item.functionDef.params)}
                                <CardHeader id={slugId}>
                                    <CardTitle class="text-lg text-primary">
                                        <a href={`#${slugId}`}>{item.name}</a>
                                    </CardTitle>
                                    <CardDescription>
                                        {#if item.isAbstract}
                                            <Badge>Abstract</Badge>
                                        {/if}
                                        {#if item.isStatic}
                                            <Badge>Static</Badge>
                                        {/if}
                                        {#if item.functionDef.isAsync}
                                            <Badge>Async</Badge>
                                        {/if}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent class={proseClasses}>
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
                                </CardContent>
                            {/snippet}
                            {#snippet select({ selectMenu })}
                                <CardFooter>
                                    {@render selectMenu({ class: 'mt-0' })}
                                </CardFooter>
                            {/snippet}
                        </OverloadSwitcher>
                    </Card>
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
