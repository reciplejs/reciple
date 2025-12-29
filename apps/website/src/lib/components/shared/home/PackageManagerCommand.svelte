<script lang="ts">
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Button } from '$lib/components/ui/button';
    import SiNpm from '@icons-pack/svelte-simple-icons/icons/SiNpm';
    import SiYarn from '@icons-pack/svelte-simple-icons/icons/SiYarn';
    import SiPnpm from '@icons-pack/svelte-simple-icons/icons/SiPnpm';
    import SiBun from '@icons-pack/svelte-simple-icons/icons/SiBun';
    import SiDeno from '@icons-pack/svelte-simple-icons/icons/SiDeno';
    import ClipboardIcon from '@lucide/svelte/icons/clipboard';
    import { toast } from 'svelte-sonner';

    let {
        commands
    }: {
        commands: Record<PackageManager, string>;
    } = $props();

    // svelte-ignore state_referenced_locally
    let currentPackageManager = $state(Object.keys(commands)[0] as PackageManager);

    async function onCopy() {
        if (!supportsClipboard()) {
            toast.error('Clipboard not supported');
            return;
        }

        await navigator.clipboard.writeText(commands[currentPackageManager]);
        toast.success('Copied command to clipboard');
    }

    function supportsClipboard() {
        return 'clipboard' in navigator;
    }
</script>

<script module>
    export type PackageManager = 'npm'|'yarn'|'pnpm'|'bun' |'deno';

    export const installCommands: Record<PackageManager, string> = {
        npm: 'npx reciple@latest create',
        yarn: 'yarn dlx reciple@latest create',
        pnpm: 'pnpx reciple@latest create',
        bun: 'bunx reciple@latest create',
        deno: 'deno run -A npm:reciple@latest create',
    };

    export const packageManagerIcons = {
        npm: SiNpm,
        yarn: SiYarn,
        pnpm: SiPnpm,
        bun: SiBun,
        deno: SiDeno
    }
</script>

<Tabs bind:value={currentPackageManager} class="bg-secondary border rounded w-full gap-0">
    <TabsList class="w-full overflow-auto justify-start bg-transparent">
        {#each Object.keys(commands) as packageManager (packageManager)}
            {@const Icon = packageManagerIcons[packageManager as PackageManager]}
            <TabsTrigger value={packageManager} class="data-[state=active]:text-primary shadow-none! font-bold border-none bg-transparent!">
                <Icon/>
                {packageManager}
            </TabsTrigger>
        {/each}
    </TabsList>
    {#each Object.keys(commands) as packageManager (packageManager)}
        <TabsContent value={packageManager} class="rounded relative whitespace-nowrap">
            <code class="block w-full px-4 py-3 pr-12 overflow-auto">
                {commands[packageManager as PackageManager]}
            </code>
            <Button
                variant="outline"
                size="icon-sm"
                class={[
                    "shrink-0 m-2 absolute top-0 right-0 z-10",
                    !supportsClipboard() && "hidden"
                ]}
                onclick={onCopy}
            >
                <ClipboardIcon/>
            </Button>
        </TabsContent>
    {/each}
</Tabs>
