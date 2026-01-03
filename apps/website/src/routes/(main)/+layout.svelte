<script lang="ts">
    import Sidebar from '$lib/components/shared/main/Sidebar.svelte';
    import Header from '$lib/components/shared/main/Header.svelte';
    import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar';
    import { pageMetadata, searchDialogState, sidebarData } from '$lib/helpers/contexts';
    import type { MarkdownMetadata } from '$lib/helpers/types';
    import '@skyra/discord-components-core';
    import { page } from '$app/state';
    import FloatingBar from '$lib/components/shared/main/FloatingBar.svelte';

    let { children } = $props();

    let metadata: MarkdownMetadata = $state({
        title: undefined,
        description: undefined
    });

    let searchState: { open?: boolean; } = $state({
        open: undefined
    });

    pageMetadata.set(metadata);
    sidebarData.set(page.data.sidebarData);
    searchDialogState.set(searchState);
</script>

<SidebarProvider style="--sidebar-width: 20rem; --sidebar-width-mobile: 20rem;">
    <Sidebar collapsible='icon'/>
    <SidebarInset class="w-[calc(100%-var(--sidebar-width))]">
        <Header title={metadata.title}/>
        <div class="flex justify-center size-full">
            <div class="container @container max-w-7xl size-full">
                {@render children?.()}
            </div>
        </div>
        <FloatingBar/>
    </SidebarInset>
</SidebarProvider>
