<script lang="ts">
    import { resolve } from '$app/paths';
    import { documentationState } from '$lib/helpers/contexts';
    import { DocType } from '$lib/helpers/types';

    let {
        name,
    }: {
        name: string;
    } = $props();

    const docState = documentationState.get();
</script>

{#if docState.documentation.classes.find(node => node.name === name)}
    <a
        class="hover:underline text-primary"
        href={resolve('/(main)/docs/[package]/[tag]/[...slug]', {
            package: docState.documentation.package,
            tag: docState.documentation.tag,
            slug: `${DocType.Class}/${name}`
        })}
    >
        {name}
    </a>
{:else}
    <span>{name}</span>
{/if}
