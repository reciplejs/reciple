<script lang="ts">
    import type { ClassPropertyDef, InterfacePropertyDef } from '@deno/doc';
    import type { HTMLAttributes } from 'svelte/elements';
    import { documentationState } from '$lib/helpers/contexts';
    import { scrollToWhenActive } from '$lib/helpers/attachments.svelte';
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from './Markdown.svelte';
    import TokensCodeBlock from './TokensCodeBlock.svelte';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import { Separator } from '$lib/components/ui/separator';

    let {
        item,
        addSeparator = false,
        ...props
    }: {
        item: ClassPropertyDef|InterfacePropertyDef;
        addSeparator?: boolean;
    } & HTMLAttributes<HTMLDivElement> = $props();

    const docState = documentationState.get();

    let slugId = $derived(docState.documentation.getElementSlug(item));
</script>

<script module>
    export function isClassPropertyDef(method: unknown): method is ClassPropertyDef {
        return 'accessibility' in (method as ClassPropertyDef);
    }
</script>

<div {...props}>
    <div id={slugId} {@attach scrollToWhenActive(slugId)}>
        <h3 class="text-lg text-primary font-bold font-mono flex flex-wrap items-center gap-2 w-full">
            {#if isClassPropertyDef(item) && item.accessibility}
                <Badge>{item.accessibility}</Badge>
            {/if}
            {#if isClassPropertyDef(item) && item.isAbstract}
                <Badge>abstract</Badge>
            {/if}
            {#if isClassPropertyDef(item) && item.isStatic}
                <Badge>static</Badge>
            {/if}
            <a href={`#${slugId}`} class="truncate">{item.name}{item.optional ? '?' : ''}</a>
        </h3>
    </div>
    <div class={proseClasses}>
        <Markdown content={item.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
        {#if item.tsType}
            <TokensCodeBlock tokens={new HumanizedTypeDef(docState).humanize(item.tsType).tokens}/>
        {/if}
    </div>
    {#if addSeparator && !item.tsType}
        <Separator class="mt-4"/>
    {/if}
</div>
