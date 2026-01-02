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

<article
    class={[
        "prose prose-neutral prose-sm md:prose-base dark:prose-invert max-w-none p-4",
        "prose-code:after:content-none prose-code:before:content-none prose-code:bg-foreground/15 prose-code:py-0.5 prose-code:px-1 prose-code:rounded-md",
        "prose-pre:prose-code:rounded-none prose-pre:prose-code:p-0 prose-pre:prose-code:bg-transparent prose-pre:leading-tight",
        "prose-a:text-primary dark:prose-a:text-blue-400 prose-a:no-underline"
    ]}
>
    <data.component/>
</article>
