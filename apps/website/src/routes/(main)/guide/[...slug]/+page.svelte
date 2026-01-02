<script lang="ts">
    import '$lib/styles/markdown.css';
    import { Separator } from '$lib/components/ui/separator';
    import { pageMetadata } from '$lib/helpers/contexts.js';

    let { data } = $props();

    let metadata = pageMetadata.get();

    $effect(() => {
        metadata.title = data.metadata?.title;
        metadata.description = data.metadata?.description;
    });
</script>


<h1 class="text-3xl font-bold">{data.metadata?.title}</h1>
<p class="text-gray-500">{data.metadata?.description}</p>
<Separator orientation="horizontal"/>
<article class="prose prose-neutral dark:prose-invert">
    <data.component/>
</article>

