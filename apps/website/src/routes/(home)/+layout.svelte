<script lang="ts">
    import Header from "$lib/components/shared/home/Header.svelte";

    let { children } = $props();
</script>

<Header/>

<div class="flex justify-center size-full">
    <main class="container max-w-7xl h-full px-6 pt-16">
        {@render children?.()}
    </main>
</div>
