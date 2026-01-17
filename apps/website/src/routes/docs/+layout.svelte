<script lang="ts">
    let { children } = $props();
</script>

<div class="size-full flex justify-center items-center-safe">
    <div class="container grid gap-10 p-2 h-fit max-w-sm [&_h1]:mb-5">
        {@render children?.()}
    </div>
</div>
