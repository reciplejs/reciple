<script lang="ts">
    import '@fontsource-variable/inter';
    import '@fontsource-variable/roboto-mono';
    import '@fontsource/archivo-black';
    import '$lib/styles/app.css';

	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<ModeWatcher/>
<Toaster/>
{@render children()}
