import type { Awaitable, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { StringSelectMenu as StringSelectMenuComponent } from '../../v1/index.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export function StringSelectMenu(props: StringSelectMenu.Props): StringSelectMenuBuilder {
    const customId = props.customId ??= DiscordSnowflake.generate().toString();

    return StringSelectMenuComponent(props);
}

export namespace StringSelectMenu {
    export interface Props extends StringSelectMenuComponent.Props {
        // TODO: Implement action for prop `onSelect`
        onSelect?: (interaction: StringSelectMenuInteraction) => Awaitable<void>;
    }
}
