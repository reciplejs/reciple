<script lang="ts">
    import { resolve } from '$app/paths';
    import { Links } from "$lib/helpers/constants";
    import { Button } from '$lib/components/ui/button';
    import SquareArrowOutUpRightIcon from '@lucide/svelte/icons/square-arrow-out-up-right';
    import PackageManagerCommand, { installCommands } from '$lib/components/shared/home/PackageManagerCommand.svelte';

</script>

<div class="size-full flex items-center-safe">
    <div class="grid grid-cols-2 pt-16 pb-20">
        <div class="grid">
            <h1 class="text-5xl font-extrabold font-archivo tracking-tight leading-tight">
                Another <a href={Links.discordJs} class="bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg shadow-primary/50">Discord.js</a> framework that just works
            </h1>
            <p class="font-medium text-lg leading-snug text-muted-foreground">
                Reciple is a Discord.js command framework. Reciple makes Discord.js command handling simple and easy using our built-in CLI tool.
            </p>
            <div class="flex gap-2 mt-5">
                <Button href={resolve('/')} variant="default" size="lg" class="font-bold px-5 shadow-sm shadow-primary/50">
                    Get Started
                </Button>
                <Button href={resolve('/')} variant="outline" size="lg" class="font-bold px-5">
                    Docs
                </Button>
                <Button href={Links.discord} variant="outline" size="lg" class="font-bold px-5">
                    Community
                    <SquareArrowOutUpRightIcon/>
                </Button>
            </div>
        </div>
        <div class="grid">
            <div class="w-full overflow-hidden">
                <PackageManagerCommand commands={installCommands}/>
            </div>
        </div>
    </div>
</div>
