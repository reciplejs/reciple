<script lang="ts">
    import type { DeclarationFunction, Symbol } from '@deno/doc';
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
        symbol,
        declarations,
        tiny = false
    }: {
        symbol: Symbol;
        declarations: DeclarationFunction[];
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();
</script>

<OverloadSwitcher data={declarations}>
    {#snippet children({ item })}
        <NodeDocHeader {symbol} declaration={item} removeIcon={tiny}/>
        <section class="mt-2 flex flex-col gap-2">
            {#if item.def.params.length}
                <DocAccordion
                    open={!tiny}
                    icon={ParenthesesIcon}
                    title="Parameters"
                >
                    <div class={proseClasses}>
                        <ParamsTable jsDoc={item.jsDoc} params={item.def.params} class="mt-5"/>
                        {#if item.def.returnType}
                            <div>
                                <p class="text-muted-foreground text-sm mt-2!">
                                    <b>Returns:</b>
                                    <TokensCodeBlock
                                        class="inline-block p-0 border-0"
                                        tokens={new HumanizedTypeDef(docState).humanize(item.def.returnType).tokens}
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
