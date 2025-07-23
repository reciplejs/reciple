import type { Awaitable, RoleSelectMenuBuilder, RoleSelectMenuInteraction } from 'discord.js';
import { RoleSelectMenu as RoleSelectMenuComponent } from '../../v1/index.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export function RoleSelectMenu(props: RoleSelectMenu.Props): RoleSelectMenuBuilder {
    const customId = props.customId ??= DiscordSnowflake.generate().toString();

    return RoleSelectMenuComponent(props);
}

export namespace RoleSelectMenu {
    export interface Props extends RoleSelectMenuComponent.Props {
        // TODO: Implement action for prop `onSelect`
        onSelect?: (interaction: RoleSelectMenuInteraction) => Awaitable<void>;
    }
}
