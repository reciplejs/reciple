<script lang="ts">
    import '@fontsource-variable/inter';
    import '@fontsource-variable/roboto-mono';
    import '@fontsource/archivo-black';
    import '$lib/styles/app.css';
    import { injectSpeedInsights } from '@vercel/speed-insights/dist/sveltekit';

	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from '$lib/components/ui/sonner';
	import { resolve } from '$app/paths';

	let { children } = $props();

    injectSpeedInsights();
</script>

<svelte:head>
    <link rel="icon" href={resolve('/') + "favicon.ico"} sizes="any">
    <link rel="apple-touch-icon" href={resolve('/') + "apple-touch-icon-180x180.png"}>
</svelte:head>

<ModeWatcher/>
<Toaster/>
{@render children()}
