<script lang="ts">
    import type { TsTypeDef, TsTypeRefDef } from '@deno/doc';
    import { documentationState } from '../../../../helpers/contexts';
    import { resolve } from '$app/paths';

    let {
        types
    }: {
        types: TsTypeDef|TsTypeDef[];
    } = $props();

    const docs = documentationState.get();
</script>

<!-- TODO: Fix types in here -->

{#snippet TypeDef(type: TsTypeDef)}
    {#if type.kind === 'array'}
        <span>{@render TypeDef(type.array)}[]</span>
    {:else if type.kind === 'typeRef'}
        <span>
            {@render TypeLink(type.typeRef)}<span>
                {#if type.typeRef.typeParams?.length}
                    <span>&lt;</span><span>{@render TypeParam(type.typeRef.typeParams)}</span><span>&gt;</span>
                {/if}
            </span>
        </span>
    {:else if type.kind === 'parenthesized'}
        <span>
            <span>(</span>{@render TypeDef(type.parenthesized)}<span>)</span>
        </span>
    {:else if type.kind === 'intersection'}
        <span>
            {#each type.intersection as subType, i}
                {#if i > 0}<span>&amp;</span>{/if}{@render TypeDef(subType)}
            {/each}
        </span>
    {:else if type.kind === 'union'}
        <span>
            {#each type.union as subType, i}
                {#if i > 0}
                    <span>|</span>
                {/if}{@render TypeDef(subType)}
            {/each}
        </span>
    {:else if type.kind === 'typePredicate'}
        {#if type.typePredicate.asserts}
            <span>assets</span>
        {/if}
        <span>{type.typePredicate.param.name || type.typePredicate.param.type}</span>
        <span>is</span>
        <span>{@render TypeDef(type.typePredicate.type!)}</span>
    {:else if type.kind === 'tuple'}
        <span>
            <span>[</span>
            {#each type.tuple as subType, i}
                {#if i > 0}<span>,</span>{/if}{@render TypeDef(subType)}
            {/each}
            <span>]</span>
        </span>
    {:else if type.kind === 'literal' && type.literal.kind === 'string'}
        <span>{`"${type.literal.string}"`}</span>
    {:else}
        <span>{type.repr}<i class="hidden">{type.kind}</i></span>
    {/if}
{/snippet}

{#snippet TypeParam(types: TsTypeDef[])}
    {#each types as type, i}
        {#if i > 0}
            <span>,</span>
            {@render TypeDef(type)}
        {:else}
            {@render TypeDef(type)}
        {/if}
    {/each}
{/snippet}

{#snippet TypeLink(type: TsTypeRefDef)}
    {@const normalized = type.typeName.startsWith('[') && type.typeName.endsWith(']') ? type.typeName.slice(1, -1) : type.typeName}
    {@const name = normalized.split('.')[0]}
    {@const prop = normalized.split('.')[1]}
    {@const node = prop ? docs.documentation.findProperty(name, prop) : docs.documentation.find(name)}
    {@const href = node && resolve('/(main)/docs/[package]/[tag]/[...slug]', {
        package: docs.documentation.package,
        tag: docs.documentation.tag,
        slug: `${node.kind}/${node.name}`
    })}
    {#if href}
        <span class="hover:underline text-primary">
            <a href={href + (prop ? `#${prop}` : '')}>
                {name}{#if prop}.{prop}{/if}
            </a>
        </span>
    {:else}
        <span>{type.typeName}</span>
    {/if}
{/snippet}

<span>
    {#each Array.isArray(types) ? types : [types] as type, i}
        {#if i > 0}<span>|</span>{/if}{@render TypeDef(type)}
    {/each}
</span>
