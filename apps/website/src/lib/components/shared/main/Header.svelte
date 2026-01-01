<script lang="ts">
    import { SidebarTrigger } from "$lib/components/ui/sidebar";
    import { Separator } from '$lib/components/ui/separator';

</script>

<header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
    <div class="flex items-center gap-2 px-4">
        <SidebarTrigger class="-ms-1" />
        <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4"/>
      </div>
</header>
