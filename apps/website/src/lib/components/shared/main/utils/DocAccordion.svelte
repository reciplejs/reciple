<script lang="ts">
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '$lib/components/ui/accordion';
    import { type Icon } from '@lucide/svelte';
    import { buttonVariants } from '$lib/components/ui/button';
    import type { Component, ComponentType, Snippet } from 'svelte';
    import type { ClassValue } from 'svelte/elements';
    import { cn } from '$lib/helpers/utils';

    let {
        open = $bindable(true),
        children,
        icon,
        title,
        class: className,
        contentClass,
        triggerClass
    }: {
        open?: boolean;
        children?: Snippet;
        icon?: typeof Icon|ComponentType|Component;
        title?: Snippet|string;
        class?: ClassValue;
        contentClass?: ClassValue;
        triggerClass?: ClassValue;
    } = $props();
</script>

<Accordion
    class={cn([className, '@container/accordion'])}
    type="single"
    bind:value={
        () => open ? 'item' : '',
        (v) => open = v === 'item'
    }
>
    <AccordionItem value="item">
        <AccordionTrigger
            class={buttonVariants({
                class: cn("justify-between no-underline!", triggerClass),
                variant: "secondary",
                size: "lg"
            })}
        >
            <span class="flex items-center gap-2">
                {#if icon}
                    {@const AccordionIcon = icon}
                    <AccordionIcon/>
                {/if}
                <span class="text-sm font-semibold">
                    {#if typeof title === 'string'}
                        {title}
                    {:else if typeof title === 'function'}
                        {@render title()}
                    {/if}
                </span>
            </span>
        </AccordionTrigger>
        <AccordionContent class={cn(["border-b border-border/60 py-3 px-4 @lg/accordion:pl-10"], contentClass)}>
            {@render children?.()}
        </AccordionContent>
    </AccordionItem>
</Accordion>
