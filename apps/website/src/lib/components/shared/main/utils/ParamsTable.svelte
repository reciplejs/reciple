<script lang="ts">
    import type { JsDoc, JsDocTagParam, ParamDef } from '@deno/doc';
    import { HumanizedParams } from '$lib/helpers/classes/humanized/HumanizedParams';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import { documentationState } from '$lib/helpers/contexts';
    import TokensCodeBlock from './TokensCodeBlock.svelte';
    import type { ClassValue } from 'svelte/elements';
    import { cn } from '$lib/helpers/utils';

    let {
        params,
        jsDoc,
        class: className
    }: {
        params: ParamDef[];
        jsDoc?: JsDoc;
        class?: ClassValue;
    } = $props();

    let docState = documentationState.get();
    let hasDescription = $derived(!!jsDoc?.tags?.some(t => t.kind === 'param' && !!t.doc));
</script>

<div class={cn(["w-full overflow-auto", className])}>
    <table class="w-full font-mono my-0! table!">
        <thead class="">
            <tr>
                <th>Param</th>
                {#if hasDescription}
                    <th>Description</th>
                {/if}
                <th>Type</th>
                <th>Required</th>
            </tr>
        </thead>
        <tbody>
            {#each params as param, i}
                {@const tokens = new HumanizedParams(docState).humanizeParam(param, true, true).tokens}
                {@const jsDocParam = jsDoc?.tags?.find((t, index): t is JsDocTagParam => t.kind === 'param' && i === index)}
                <tr>
                    <td style="word-wrap: break-word;">
                        <TokensCodeBlock tokens={tokens} class="p-0 border-0"/>
                    </td>
                    {#if hasDescription}
                        <td style="word-wrap: break-word;">
                            {jsDocParam?.doc ?? ''}
                        </td>
                    {/if}
                    <td style="word-wrap: break-word;">
                        {#if param.tsType}
                            <TokensCodeBlock class="p-0 border-0" tokens={new HumanizedTypeDef(docState).humanize(param.tsType).tokens}/>
                        {:else if param.kind === 'assign' && param.left.tsType}
                            <TokensCodeBlock class="p-0 border-0" tokens={new HumanizedTypeDef(docState).humanize(param.left.tsType).tokens}/>
                        {/if}
                    </td>
                    <td style="word-wrap: break-word;">
                        {'optional' in param && !param.optional ? 'Yes' : 'No'}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
