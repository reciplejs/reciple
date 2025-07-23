import type { Awaitable, ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import { Modal as ModalComponent } from '../../modal/index.js';
import { DiscordSnowflake } from '@sapphire/snowflake';

export function Modal(props: Modal.Props): ModalBuilder {
    const customId = props.customId ??= DiscordSnowflake.generate().toString();

    return ModalComponent(props);
}

export namespace Modal {
    export interface Props extends ModalComponent.Props {
        // TODO: Implement action for prop `onSubmit`
        onSubmit?: (interaction: ModalSubmitInteraction) => Awaitable<void>;
    }
}
