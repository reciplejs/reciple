<script lang="ts">
    import { resolve } from "$app/paths";
    import ButtonLinks from '../ButtonLinks.svelte';
    import DropdownLinks from '../DropdownLinks.svelte';

    let {
        scrolling = $bindable(false)
    }: {
        scrolling?: boolean
    } = $props();

    $effect(() => {
        onScroll();
    });

    function onScroll() {
        scrolling = window.scrollY > 0;
    }
</script>

<svelte:window onscroll={onScroll}/>

<header
    class={[
        "z-50 fixed top-0 left-0 h-16 w-full border-b border-transparent flex center justify-center items-center transition-all duration-300 ease-in-out",
        scrolling && "border-border! shadow bg-background/80 backdrop-blur-md"
    ]}
>
    <nav class="container max-w-7xl flex items-center gap-10 px-6">
        <a href={resolve('/(home)')} class="text-2xl sm:text-3xl font-bold -translate-y-0.5 text-primary dark:text-foreground">
            reciple
        </a>
        <div class="flex sm:justify-between justify-end items-center gap-4 w-full">
            <div class="flex gap-4 font-semibold opacity-80">
                <a href={resolve('/(main)/guide')}>Guide</a>
                <a href={resolve('/(main)/docs')}>Docs</a>
            </div>
            <ButtonLinks/>
            <DropdownLinks/>
        </div>
    </nav>
</header>
