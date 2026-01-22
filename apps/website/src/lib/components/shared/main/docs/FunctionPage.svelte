<script lang="ts">
    import type { DocNodeFunction } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import ParamsTable from '../utils/ParamsTable.svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { ParenthesesIcon } from '@lucide/svelte';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import OverloadSwitcher from '../utils/OverloadSwitcher.svelte';

    let {
        nodes,
        tiny = false
    }: {
        nodes: DocNodeFunction[];
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();
</script>

<OverloadSwitcher data={nodes}>
    {#snippet children({ item })}
        <NodeDocHeader node={item}/>
        <section class="mt-2 grid gap-2">
            {#if item.functionDef.params.length}
                <DocAccordion
                    open={!tiny}
                    icon={ParenthesesIcon}
                    title="Parameters"
                >
                    <div class={proseClasses}>
                        <ParamsTable jsDoc={item.jsDoc} params={item.functionDef.params} class="mt-5"/>
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
                </DocAccordion>
            {/if}
        </section>
    {/snippet}
</OverloadSwitcher>
