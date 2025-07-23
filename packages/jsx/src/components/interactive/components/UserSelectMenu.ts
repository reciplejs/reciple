import type { Awaitable, UserSelectMenuBuilder, UserSelectMenuInteraction } from 'discord.js';
import { UserSelectMenu as UserSelectMenuComponent } from '../../v1/index.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export function UserSelectMenu(props: UserSelectMenu.Props): UserSelectMenuBuilder {
    const customId = props.customId ??= DiscordSnowflake.generate().toString();

    return UserSelectMenuComponent(props);
}

export namespace UserSelectMenu {
    export interface Props extends UserSelectMenuComponent.Props {
        // TODO: Implement action for prop `onSelect`
        onSubmit?: (interaction: UserSelectMenuInteraction) => Awaitable<void>;
    }
}
