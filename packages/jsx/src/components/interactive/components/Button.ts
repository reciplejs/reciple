import type { Awaitable, ButtonBuilder, ButtonInteraction } from 'discord.js';
import { Button as ButtonComponent } from '../../v1/index.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export function Button(props: Button.Props): ButtonBuilder {
    const customId = props.customId ??= DiscordSnowflake.generate().toString();

    return ButtonComponent(props);
}

export namespace Button {
    export interface Props extends ButtonComponent.Props {
        // TODO: Implement action for prop `onClick`
        onClick?: (interaction: ButtonInteraction) => Awaitable<void>;
    }
}
