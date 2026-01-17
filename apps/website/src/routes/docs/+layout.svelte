<script lang="ts">
    let { children } = $props();
</script>

<div class="size-full flex justify-center">
    <div class="container grid gap-2 p-2 h-fit max-w-lg mt-auto mb-auto">
        {@render children?.()}
    </div>
</div>
