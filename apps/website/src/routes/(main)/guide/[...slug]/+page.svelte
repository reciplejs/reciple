<script lang="ts">
    import '$lib/styles/markdown.css';
    import { pageMetadata } from '$lib/helpers/contexts.js';
    import { MetaTags } from 'svelte-meta-tags';

    let { data } = $props();

    let metadata = pageMetadata.get();

    $effect(() => {
        metadata.title = data.metadata?.title;
        metadata.description = data.metadata?.description;
    });
</script>

<MetaTags titleTemplate="reciple | %s" {...data.metadata}/>

<article class="prose prose-neutral prose-sm md:prose-base prose-table:overflow-auto prose-table:max-w-full dark:prose-invert max-w-none p-4">
    <data.component/>
</article>

