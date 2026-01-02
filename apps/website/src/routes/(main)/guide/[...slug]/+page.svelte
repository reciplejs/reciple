<script lang="ts">
    import { Separator } from '$lib/components/ui/separator';

    let { data } = $props();
</script>


<h1>{data.metadata?.title}</h1>
<p>{data.metadata?.description}</p>
<Separator orientation="horizontal"/>
<article class="prose">
    <data.component/>
</article>

