<script lang="ts">
    import { SidebarTrigger } from "$lib/components/ui/sidebar";
    import { Separator } from '$lib/components/ui/separator';
    import { Button } from '../../ui/button';
    import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';

    let {
        title
    }: {
        title?: string;
    } = $props();
</script>

<header
    class={[
        "sticky top-0 z-50 bg-background flex h-16 border-b shrink-0 items-center gap-2",
        "transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    ]}
>
    <div class="flex items-center gap-2 px-4 overflow-hidden w-full">
        <SidebarTrigger class="-ms-1"/>
        <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4"/>
        <h3 class="text-lg font-semibold w-full truncate overflow-hidden text-nowrap shrink">{title}</h3>
        <div class="shrink-0">
            <Button variant="outline" size="icon">
                <SiGithub/>
            </Button>
        </div>
    </div>
</header>
