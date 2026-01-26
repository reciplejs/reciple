<script lang="ts">
    import Sidebar from '$lib/components/shared/main/Sidebar.svelte';
    import Header from '$lib/components/shared/main/Header.svelte';
    import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar';
    import { searchDialogState, sidebarData } from '$lib/helpers/contexts';
    import type { SidebarData } from '$lib/helpers/types';
    import '@skyra/discord-components-core';
    import { page } from '$app/state';
    import FloatingBar from '$lib/components/shared/main/FloatingBar.svelte';

    let { children } = $props();

    let searchState: { open?: boolean; } = $state({
        open: undefined
    });

    let sidebar: SidebarData = $state({});

    sidebarData.set(sidebar);
    searchDialogState.set(searchState);

    $effect(() => {
        sidebar.header = page.data.sidebarData.header;
        sidebar.content = page.data.sidebarData.content;
    });
</script>

<SidebarProvider style="--sidebar-width: 20rem; --sidebar-width-mobile: 20rem;">
    <Sidebar collapsible='icon'/>
    <SidebarInset class="w-[calc(100%-var(--sidebar-width))]">
        <Header title={page.data.metadata?.title}/>
        <div class="flex justify-center size-full">
            <div class="container @container max-w-7xl size-full">
                {@render children?.()}
            </div>
        </div>
        <FloatingBar/>
    </SidebarInset>
</SidebarProvider>
