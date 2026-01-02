<script lang="ts">
    import { Separator } from '$lib/components/ui/separator';

    let { data } = $props();
</script>


<h1 class="text-3xl font-bold">{data.metadata?.title}</h1>
<p class="text-gray-500">{data.metadata?.description}</p>
<Separator orientation="horizontal"/>
<article class="prose dark:prose-invert">
    <data.component/>
</article>

