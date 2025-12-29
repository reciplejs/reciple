<script lang="ts">
    import '@fontsource-variable/inter';
    import '@fontsource-variable/roboto-mono';
    import '@fontsource/archivo-black';
    import '$lib/styles/app.css';

	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<ModeWatcher/>
{@render children()}
