<script lang="ts">
    import type { TabsRootProps } from 'bits-ui';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Button } from '$lib/components/ui/button';
    import { cn } from '$lib/helpers/utils';
    import SiNpm from '@icons-pack/svelte-simple-icons/icons/SiNpm';
    import SiYarn from '@icons-pack/svelte-simple-icons/icons/SiYarn';
    import SiPnpm from '@icons-pack/svelte-simple-icons/icons/SiPnpm';
    import SiBun from '@icons-pack/svelte-simple-icons/icons/SiBun';
    import SiDeno from '@icons-pack/svelte-simple-icons/icons/SiDeno';
    import ClipboardIcon from '@lucide/svelte/icons/clipboard';
    import { toast } from 'svelte-sonner';

    let {
        value = $bindable('npm'),
        ...props
    }: TabsRootProps & {
        value?: keyof typeof installCommands;
    } = $props();

    const installCommands = {
        npm: 'npx reciple@latest create',
        yarn: 'yarn dlx reciple@latest create',
        pnpm: 'pnpx reciple@latest create',
        bun: 'bunx reciple@latest create',
        deno: 'deno run -A npm:reciple@latest create'
    };

    const commandIcons = {
        npm: SiNpm,
        yarn: SiYarn,
        pnpm: SiPnpm,
        bun: SiBun,
        deno: SiDeno
    };

    let currentValue: typeof installCommands[keyof typeof installCommands] = $derived(installCommands[value]);

    async function copyToClipboard() {
        if (!supportsClipboard()) {
            toast.error('Clipboard not supported');
            return;
        }

        await navigator.clipboard.writeText(currentValue);
        toast.success('Copied command to clipboard');
    }

    function supportsClipboard() {
        return typeof navigator !== 'undefined' && 'clipboard' in navigator && 'writeText' in navigator.clipboard;
    }
</script>

<Tabs bind:value {...props} class={cn("bg-card rounded border p-1 w-full", props.class)}>
    <TabsList class="w-full overflow-auto h-fit justify-start bg-transparent rounded-b-none border-b pb-2">
        {#each Object.keys(installCommands) as pkgManager}
            {@const Icon = commandIcons[pkgManager as keyof typeof commandIcons]}
            <TabsTrigger value={pkgManager} class="flex items-center gap-2 py-2 font-semibold shadow-none! border-none! data-[state=active]:bg-foreground/5!">
                <Icon/>
                <span>{pkgManager}</span>
            </TabsTrigger>
        {/each}
    </TabsList>
    {#each Object.entries(installCommands) as [pkgManager, command]}
        <TabsContent value={pkgManager}>
            <div class="p-1 text-start text-sm flex items-center gap-2 relative whitespace-nowrap">
                <button class="**:select-all w-full px-2.5 overflow-auto text-start" onclick={copyToClipboard}>
                    <code>{command}</code>
                </button>
                <Button
                    variant="outline"
                    size="icon"
                    class={[
                        "relative overflow-clip",
                        !supportsClipboard() && "hidden"
                    ]}
                    onclick={copyToClipboard}
                >
                    <ClipboardIcon/>
                </Button>
            </div>
        </TabsContent>
    {/each}
</Tabs>
