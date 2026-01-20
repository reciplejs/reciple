<script lang="ts">
    import type { DocNodeClass } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon, LayoutListIcon } from '@lucide/svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { HumanizedParams } from '$lib/helpers/classes/humanized/HumanizedParams';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import OverloadSwitcher from '../utils/OverloadSwitcher.svelte';

    let {
        node
    }: {
        node: DocNodeClass;
    } = $props();

    const docState = documentationState.get();
</script>

<NodeDocHeader {node}/>

<section class="mt-2">
    {#if node.classDef.constructors.length > 0}
        <DocAccordion
            icon={BoxIcon}
            title="Constructor"
        >
            <OverloadSwitcher data={node.classDef.constructors}>
                {#snippet children({ item })}
                    <div class={proseClasses}>
                        <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                        {#if item.params.length > 0}
                            {@const humanized = new HumanizedParams(docState).humanize(item.params)}
                            <TokensCodeBlock tokens={humanized.tokens}/>
                            <ParamsTable params={item.params} class="mt-5"/>
                        {/if}
                    </div>
                {/snippet}
            </OverloadSwitcher>
        </DocAccordion>
    {/if}
    <DocAccordion
        icon={LayoutListIcon}
        title="Table of contents"
    >
        {@const methods = 'methods' in node.classDef ? node.classDef.methods : []}
        {@const properties = 'properties' in node.classDef ? node.classDef.properties : []}

        <div class="grid gap-2 @2xl:grid-cols-2">
            {#if methods.length > 0}
                <DocAccordion
                    title="Methods"
                    contentClass="border-b-0"
                >
                    {#each methods as method}
                        <a href={`#${docState.documentation.getElementSlug(method)}`} class="block text-primary text-base py-1 w-fit">
                            {method.name}{method.optional ? '?' : ''}
                        </a>
                    {/each}
                </DocAccordion>
            {/if}
            {#if properties.length > 0}
                <DocAccordion
                    title="Properties"
                    contentClass="border-b-0"
                >
                    {#each properties as property}
                        <a href={`#${docState.documentation.getElementSlug(property)}`} class="block text-primary text-base py-1 w-fit">
                            {property.name}{property.optional ? '?' : ''}
                        </a>
                    {/each}
                </DocAccordion>
            {/if}
        </div>
    </DocAccordion>
</section>
