<script lang="ts">
    import type { DocNodeClass, DocNodeEnum, DocNodeInterface, DocNodeNamespace } from '@deno/doc';
    import DocAccordion from './DocAccordion.svelte';
    import { BoxIcon, KeyIcon, Layers2Icon, LayoutListIcon, WrenchIcon } from '@lucide/svelte';
    import { Button } from '../../../ui/button';
    import { documentationState } from '../../../../helpers/contexts';

    let {
        node
    }: {
        node: DocNodeClass|DocNodeInterface|DocNodeNamespace|DocNodeEnum;
    } = $props();

    let docState = documentationState.get();

    let methods = $derived(
        node.kind === 'class'
            ? node.classDef.methods
            : node.kind === 'interface'
                ? node.interfaceDef.methods
                : []
        );

    let properties = $derived(
        node.kind === 'class'
            ? node.classDef.properties
            : node.kind === 'interface'
                ? node.interfaceDef.properties
                : []
        );

    let elements = $derived(
        node.kind === 'namespace'
            ? node.namespaceDef.elements
            : []
        );

    let members = $derived(
        node.kind === 'enum'
            ? node.enumDef.members
            : []
        );

    let lengths = $derived([methods.length, properties.length, elements.length, members.length]);
    let items = $derived(methods.length + properties.length + elements.length + members.length);
</script>

{#snippet LinkButton(label: string, href: string)}
    <Button {href} variant="ghost" class="block font-mono truncate text-sm">
        {label}
    </Button>
{/snippet}

{#if items > 0}
    <DocAccordion
        icon={LayoutListIcon}
        title="Table of contents"
    >
        <div class="grid gap-2" class:@2xl:grid-cols-2={lengths.filter((length) => length > 0).length > 1}>
            {#if methods.length > 0}
                <DocAccordion icon={BoxIcon} title="Methods" contentClass="border-b-0" triggerClass="bg-secondary/60">
                    {#each methods as method}
                        {@render LinkButton(`${method.name}${method.optional ? '?' : ''}`, `#${docState.documentation.getElementSlug(method)}`)}
                    {/each}
                </DocAccordion>
            {/if}
            {#if properties.length > 0}
                <DocAccordion icon={WrenchIcon} title="Properties" contentClass="border-b-0" triggerClass="bg-secondary/60">
                    {#each properties as property}
                        {@render LinkButton(`${property.name}${property.optional ? '?' : ''}`, `#${docState.documentation.getElementSlug(property)}`)}
                    {/each}
                </DocAccordion>
            {/if}
            {#if elements.length > 0}
                <DocAccordion icon={Layers2Icon} title="Elements" contentClass="border-b-0" triggerClass="bg-secondary/60">
                    {#each elements as element}
                        {@render LinkButton(element.name, `#${docState.documentation.getElementSlug(element)}`)}
                    {/each}
                </DocAccordion>
            {/if}
            {#if members.length > 0}
                <DocAccordion icon={KeyIcon} title="Members" contentClass="border-b-0" triggerClass="bg-secondary/60">
                    {#each members as member}
                        {@render LinkButton(member.name, `#${docState.documentation.getElementSlug(member)}`)}
                    {/each}
                </DocAccordion>
            {/if}
        </div>
    </DocAccordion>
{/if}
