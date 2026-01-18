<script lang="ts">
    import type { DocNode } from '@deno/doc';
    import { DocTypeIcons } from '$lib/helpers/constants';
    import { DocType } from '$lib/helpers/types';
    import ClassReference from './ClassReference.svelte';
    import TypeDef from './TypeDef.svelte';

    let {
        node
    }: {
        node: DocNode;
    } = $props();

    let Icon = $derived(DocTypeIcons[node.kind as DocType]);
</script>

<div class="grid mb-4">
    <p class="ml-8 text-sm font-normal text-muted-foreground">{node.kind}</p>
    <div class="flex gap-2 items-center overflow-hidden">
        <Icon class="shrink-0"/>
        <h1 class="text-2xl font-bold truncate">{node.name}</h1>
    </div>
    <p class="ml-8 text-sm font-normal text-muted-foreground">
        {#if node.kind === 'class' && node.classDef.extends}
            extends <ClassReference name={node.classDef.extends}/>
        {:else if node.kind === 'interface' && node.interfaceDef.extends}
            extends <TypeDef types={node.interfaceDef.extends}/>
        {/if}
        {#if node.kind === 'class' && node.classDef.implements.length}
            implements <TypeDef types={node.classDef.implements}/>
        {/if}
    </p>
</div>
