<script lang="ts">
    import '@fontsource-variable/inter';
    import '@fontsource-variable/roboto-mono';
    import '@fontsource/archivo-black';
    import '$lib/styles/app.css';

    import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from '$lib/components/ui/sonner';
    import { resolve } from '$app/paths';
    import { navigating, page } from '$app/state';
    import { fade } from 'svelte/transition';
    import { deepMerge, MetaTags } from 'svelte-meta-tags';

	let {
        data,
        children
    } = $props();

    injectSpeedInsights();

    let metatags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
</script>

<svelte:head>
    <link rel="icon" href={resolve('/') + "favicon.ico"} sizes="any">
    <link rel="apple-touch-icon" href={resolve('/') + "apple-touch-icon-180x180.png"}>
</svelte:head>

<MetaTags {...metatags}/>
<ModeWatcher/>
<Toaster/>

{#if navigating.to}
    <style>
        body {
            overflow: hidden;
            cursor: progress;
        }

        .animate-progress {
            animation: progress 3s ease-in-out forwards;
            width: 90%;
        }

        @keyframes progress {
            0% {
                width: 0;
            }
            60% {
                width: 40%;
            }
            80% {
                width: 70%;
            }
            100% {
                width: 90%;
            }
        }
    </style>
    <div
        in:fade={{ delay: 300, duration: 300 }}
        class="fixed top-0 left-0 right-0 z-999 size-full cursor-progress bg-background/20 backdrop-blur-xs pointer-events-none"
    >
        <span class="absolute top-0 left-0 h-1 w-full bg-foreground/30">
            <span class="absolute top-0 left-0 h-full bg-primary animate-progress"></span>
        </span>
    </div>
{/if}

{@render children()}
