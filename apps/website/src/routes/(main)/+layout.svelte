<script lang="ts">
    import Sidebar from '$lib/components/shared/main/Sidebar.svelte';
    import Header from '$lib/components/shared/main/Header.svelte';
    import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar';
    import { pageMetadata } from '$lib/helpers/contexts';
    import type { MarkdownMetadata } from '../../lib/helpers/types';

    let { children } = $props();

    let metadata: MarkdownMetadata = $state({
        title: undefined,
        description: undefined
    });

    pageMetadata.set(metadata);
</script>

<SidebarProvider style="--sidebar-width: 20rem; --sidebar-width-mobile: 20rem;">
    <Sidebar collapsible='icon'/>
    <SidebarInset>
        <Header title={metadata.title}/>
        {@render children?.()}
    </SidebarInset>
</SidebarProvider>
