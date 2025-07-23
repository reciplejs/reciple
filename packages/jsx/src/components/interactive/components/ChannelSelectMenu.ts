import type { Awaitable, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction } from 'discord.js';
import { ChannelSelectMenu as ChannelSelectMenuComponent } from '../../v1/index.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export function ChannelSelectMenu(props: ChannelSelectMenu.Props): ChannelSelectMenuBuilder {
    const customId = props.customId ??= DiscordSnowflake.generate().toString();

    return ChannelSelectMenuComponent(props);
}

export namespace ChannelSelectMenu {
    export interface Props extends ChannelSelectMenuComponent.Props {
        // TODO: Implement action for prop `onSelect`
        onSelect?: (interaction: ChannelSelectMenuInteraction) => Awaitable<void>;
    }
}
