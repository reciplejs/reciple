<script lang="ts">
    import type { DocNodeEnum } from '@deno/doc';
    import NodeDocHeader from '../utils/NodeDocHeader.svelte';
    import TableOfContents from '../utils/TableOfContents.svelte';
    import DocAccordion from '../utils/DocAccordion.svelte';
    import { KeyIcon } from '@lucide/svelte';
    import { documentationState } from '../../../../helpers/contexts';
    import { proseClasses } from '../../../../helpers/constants';
    import Markdown from '../utils/Markdown.svelte';
    import TokensCodeBlock from '../utils/TokensCodeBlock.svelte';
    import { HumanizedTypeDef } from '../../../../helpers/classes/humanized/HumanizedTypeDef';

    let {
        node
    }: {
        node: DocNodeEnum;
    } = $props();

    const docState = documentationState.get();

    let members = $derived(node.enumDef.members);
</script>

<section class="mt-2 grid gap-2">
    <NodeDocHeader {node}/>
    <TableOfContents {members}/>
</section>
{#if members.length}
    <section>
        <DocAccordion
            icon={KeyIcon}
            title="Members"
            contentClass="border-b-0"
        >
            <div class="w-full flex flex-col gap-5">
                {#each members as member}
                    {@const slugId = docState.documentation.getElementSlug(member)}
                    <div>
                        <div id={slugId}>
                            <h3 class="text-lg text-primary font-bold font-mono flex flex-wrap items-center gap-2 w-full">
                                <a href={`#${slugId}`} class="truncate">{member.name}</a>
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
                {/each}
            </div>
        </DocAccordion>
    </section>
{/if}
