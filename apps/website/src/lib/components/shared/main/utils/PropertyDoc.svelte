<script lang="ts">
    import type { ClassPropertyDef, InterfacePropertyDef } from '@deno/doc';
    import type { HTMLAttributes } from 'svelte/elements';
    import { documentationState } from '$lib/helpers/contexts';
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from './Markdown.svelte';
    import TokensCodeBlock from './TokensCodeBlock.svelte';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import { Separator } from '$lib/components/ui/separator';
    import SourceButton from './SourceButton.svelte';

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

<script lang="ts" module>
    export function isClassPropertyDef(method: unknown): method is ClassPropertyDef {
        return 'accessibility' in (method as ClassPropertyDef);
    }
</script>

<div {...props}>
    <div class="grid mb-2" id={slugId}>
        <div class="flex flex-wrap gap-1">
            {#if isClassPropertyDef(item) && item.accessibility}
                <Badge>{item.accessibility}</Badge>
            {/if}
            {#if isClassPropertyDef(item) && item.isAbstract}
                <Badge>abstract</Badge>
            {/if}
            {#if isClassPropertyDef(item) && item.isStatic}
                <Badge>static</Badge>
            {/if}
            <SourceButton location={item.location}/>
        </div>
        <h3 class="text-lg font-bold font-mono truncate w-full">
            .<a href={`#${slugId}`}>{item.name}{item.optional ? '?' : ''}</a>
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
