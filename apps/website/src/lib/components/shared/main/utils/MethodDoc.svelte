<script lang="ts">
    import type { ClassMethodDef, InterfaceMethodDef } from '@deno/doc';
    import type { HTMLAttributes } from 'svelte/elements';
    import OverloadSwitcher from './OverloadSwitcher.svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import { HumanizedTypeParams } from '$lib/helpers/classes/humanized/HumanizedTypeParams';
    import { HumanizedParams } from '$lib/helpers/classes/humanized/HumanizedParams';
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from './Markdown.svelte';
    import TokensCodeBlock from './TokensCodeBlock.svelte';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import ParamsTable from './ParamsTable.svelte';
    import { Separator } from '$lib/components/ui/separator';
    import SourceButton from './SourceButton.svelte';

    let {
        overloads,
        addSeparator = false,
        ...props
    }: {
        overloads: (ClassMethodDef|InterfaceMethodDef)[];
        addSeparator?: boolean;
    } & HTMLAttributes<HTMLDivElement> = $props();

    const docState = documentationState.get();

    let method = $derived(overloads[0]);
</script>

<script module>
    export function isClassMethodDef(method: unknown): method is ClassMethodDef {
        return 'functionDef' in (method as ClassMethodDef);
    }
</script>

<div {...props}>
    <OverloadSwitcher data={overloads}>
        {#snippet children({ item, selectMenu })}
            {@const slugId = docState.documentation.getElementSlug(item)}
            {@const params = isClassMethodDef(item) ? item.functionDef.params : item.params}
            {@const typeParams = isClassMethodDef(item) ? item.functionDef.typeParams : item.typeParams}
            {@const returnType = isClassMethodDef(item) ? item.functionDef.returnType : item.returnType}
            {@const humanizedTypeParams = new HumanizedTypeParams(docState).humanize(typeParams)}
            {@const humanizedParams = new HumanizedParams(docState).humanize(params)}
            <div class="grid mb-2" id={slugId}>
                <div class="flex flex-wrap gap-1">
                    {#if isClassMethodDef(item) && item.accessibility}
                        <Badge>{item.accessibility}</Badge>
                    {/if}
                    {#if isClassMethodDef(item) && item.isAbstract}
                        <Badge>abstract</Badge>
                    {/if}
                    {#if isClassMethodDef(item) && item.isStatic}
                        <Badge>static</Badge>
                    {/if}
                    {#if isClassMethodDef(item) && item.kind !== 'method'}
                        <Badge>{item.kind.substring(0, 3)}</Badge>
                    {/if}
                    {#if isClassMethodDef(item) && item.functionDef.isAsync}
                        <Badge>async</Badge>
                    {/if}
                    <SourceButton location={item.location}/>
                </div>
                <h3 class="text-lg font-bold font-mono truncate w-full">
                    .<a href={`#${slugId}`}>{item.name}{method.optional ? '?' : ''}</a>({params.length ? '...' : ''})
                </h3>
            </div>
            <div class={proseClasses}>
                <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                <TokensCodeBlock
                    tokens={[
                        item.name,
                        ...(typeParams.length ? humanizedTypeParams.tokens : []
                        ),
                        ...humanizedParams.tokens,
                        ...(returnType
                            ? [':', ' ', ...new HumanizedTypeDef(docState).humanize(returnType).tokens]
                            : []
                        )
                    ]}
                />
                {#if params.length}
                    <ParamsTable jsDoc={item.jsDoc} params={params} class="mt-5"/>
                {/if}
                {#if returnType}
                    <div>
                        <p class="text-muted-foreground text-sm mt-2!">
                            <b>Returns:</b>
                            <TokensCodeBlock
                                class="inline-block p-0 border-0"
                                tokens={new HumanizedTypeDef(docState).humanize(returnType).tokens}
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
    {#if addSeparator}
        <Separator/>
    {/if}
</div>
