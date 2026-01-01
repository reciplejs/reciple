<script lang="ts">
    import Sidebar from '$lib/components/shared/main/Sidebar.svelte';
    import Header from '$lib/components/shared/main/Header.svelte';
    import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar';

    let { children } = $props();
</script>

<SidebarProvider style="--sidebar-width: 20rem; --sidebar-width-mobile: 20rem;">
    <Sidebar collapsible='icon'/>
    <SidebarInset>
        <Header/>
        {@render children?.()}
    </SidebarInset>
</SidebarProvider>
