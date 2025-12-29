<script lang="ts">
    import { resolve } from '$app/paths';
    import { Links } from "$lib/helpers/constants";
    import { Button } from '$lib/components/ui/button';
    import SquareArrowOutUpRightIcon from '@lucide/svelte/icons/square-arrow-out-up-right';
    import PackageManagerCommand from '$lib/components/shared/home/PackageManagerCommand.svelte';

</script>

<div class="size-full flex items-center-safe">
    <div class="flex flex-col sm:flex-row pt-16 pb-20 gap-10 sm:gap-5 lg:gap-20 w-full">
        <div class="grid">
            <h1 class="text-5xl font-black font-archivo tracking-tight leading-tight">
                Another <a href={Links.discordJs} class="bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg shadow-primary/50">Discord.js</a> framework that just works
            </h1>
            <p class="font-medium text-lg leading-snug text-muted-foreground">
                Reciple is a Discord.js command framework. Reciple makes Discord.js command handling simple and easy using our built-in CLI tool.
            </p>
            <div class="flex flex-col sm:flex-row gap-2 mt-10 lg:mt-5">
                <Button href={resolve('/')} variant="default" size="lg" class="font-bold px-5 sm:w-1/3! md:w-fit! justify-start! sm:justify-center! shrink! shadow-sm shadow-primary/50">
                    Get Started
                </Button>
                <Button href={resolve('/')} variant="secondary" size="lg" class="font-bold px-5 sm:w-1/3! md:w-fit! justify-start! sm:justify-center! shrink! border">
                    Docs
                </Button>
                <Button href={Links.discord} variant="secondary" size="lg" class="font-bold px-5 sm:w-1/3! md:w-fit! justify-start! sm:justify-center! shrink! border">
                    Community
                    <SquareArrowOutUpRightIcon/>
                </Button>
            </div>
        </div>
        <div class="flex items-center w-full max-w-lg">
            <PackageManagerCommand/>
        </div>
    </div>
</div>
