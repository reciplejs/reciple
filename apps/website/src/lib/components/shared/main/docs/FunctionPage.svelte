<script lang="ts">
    import type { DocNodeFunction } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import { proseClasses } from '../../../../helpers/constants';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { documentationState } from '../../../../helpers/contexts';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { ParenthesesIcon } from '@lucide/svelte';
    import { HumanizedTypeDef } from '../../../../helpers/classes/humanized/HumanizedTypeDef';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';

    let {
        node
    }: {
        node: DocNodeFunction;
    } = $props();

    const docState = documentationState.get();
</script>

<NodeDocHeader {node}/>

<section class="mt-2">
    {#if node.functionDef.params.length > 0}
        <DocAccordion
            icon={ParenthesesIcon}
            title="Parameters"
        >
            <div class={proseClasses}>
                <ParamsTable params={node.functionDef.params} class="mt-5"/>
                {#if node.functionDef.returnType}
                    <div>
                        <p class="text-muted-foreground text-sm mt-2!">
                            <b>Returns:</b>
                            <TokensCodeBlock class="inline-block p-0 border-0" tokens={new HumanizedTypeDef(docState).humanize(node.functionDef.returnType).tokens}/>
                        </p>
                    </div>
                {/if}
            </div>
        </DocAccordion>
    {/if}
</section>
