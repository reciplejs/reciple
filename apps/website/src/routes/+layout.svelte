<script lang="ts">
    import '@fontsource-variable/inter';
    import '@fontsource-variable/roboto-mono';
    import '@fontsource/archivo-black';
    import '$lib/styles/app.css';

	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from '$lib/components/ui/sonner';
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
    <link rel="shortcut icon" href={resolve('/') + 'favicon.png'} type="image/png">
</svelte:head>

<ModeWatcher/>
<Toaster/>
{@render children()}
