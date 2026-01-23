<script lang="ts">
    import type { DocNodeEnum } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { KeyIcon } from '@lucide/svelte';
    import { documentationState } from '$lib/helpers/contexts';
    import { proseClasses } from '$lib/helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import { HumanizedTypeDef } from '$lib/helpers/classes/humanized/HumanizedTypeDef';
    import SourceButton from '../utils/SourceButton.svelte';
    import { Separator } from '../../../ui/separator';

    let {
        node,
        tiny = false
    }: {
        node: DocNodeEnum;
        tiny?: boolean;
    } = $props();

    const docState = documentationState.get();

    let members = $derived(node.enumDef.members);
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node} removeIcon={tiny}/>
    <TableOfContents {members} open={!tiny}/>
</section>
{#if members.length}
    <section>
        <DocAccordion
            open={!tiny}
            icon={KeyIcon}
            title="Members"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each members as member, index}
                    {@const slugId = docState.documentation.getElementSlug(member)}
                    <div>
                        <div class="grid mb-2" id={slugId}>
                            <div class="flex flex-wrap gap-1">
                                <SourceButton location={member.location}/>
                            </div>
                            <h3 class="text-lg font-bold font-mono truncate w-full">
                                .<a href={`#${slugId}`}>{member.name}</a>
                            </h3>
                        </div>
                        <div class={proseClasses}>
                            <Markdown content={member.jsDoc?.doc?.trim() ?? 'No summary provided'}/>
                            {#if member.init}
                                <TokensCodeBlock tokens={[
                                    member.name,
                                    ' ', '=', ' ',
                                    ...new HumanizedTypeDef(docState).humanize(member.init).tokens]}
                                />
                            {/if}
                        </div>
                    </div>
                    {#if index !== members.length - 1}
                        <Separator/>
                    {/if}
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
