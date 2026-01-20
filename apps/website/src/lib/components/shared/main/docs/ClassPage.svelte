<script lang="ts">
    import type { DocNodeClass } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { BoxIcon } from '@lucide/svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { HumanizedParams } from '../../../../helpers/classes/humanized/HumanizedParams';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';

    let {
        node
    }: {
        node: DocNodeClass;
    } = $props();
</script>

<NodeDocHeader {node}/>

<section class="mt-2">
    {#if node.classDef.constructors.length > 0}
        <DocAccordion
            open
            icon={BoxIcon}
            title="Constructor"
        >
            {#each node.classDef.constructors as constructor}
                <div class={proseClasses}>
                    <Markdown content={constructor.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                    {#if constructor.params.length > 0}
                        {@const humanized = new HumanizedParams().humanize(constructor.params)}
                        <TokensCodeBlock tokens={humanized.tokens}/>
                        <ParamsTable params={constructor.params}/>
                    {/if}
                </div>
            {/each}
        </DocAccordion>
    {/if}
</section>
