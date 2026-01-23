import { ComponentType, isJSONEncodable, ModalBuilder, type APIModalInteractionResponseCallbackComponent, type JSONEncodable, type ModalComponentData } from 'discord.js';
import { JSX } from '../../../structures/JSX.js';

export function Modal(props: Modal.Props): ModalBuilder {
    const builder = new ModalBuilder();

    if (props.customId !== undefined) builder.setCustomId(props.customId);
    if (props.title !== undefined) builder.setTitle(props.title);

    const children = JSX.useSingleToArray(props.children)
        .map(c => isJSONEncodable(c) ? c.toJSON() : c)
        .filter(d => !!d);

    for (const component of children) {
        switch (component.type) {
            case ComponentType.ActionRow:
                builder.addComponents(component);
                break;
            case ComponentType.TextDisplay:
                builder.addTextDisplayComponents(component);
                break;
            case ComponentType.Label:
                builder.addLabelComponents(component);
                break;
        }
    }

    return builder;
}

export namespace Modal {
    export interface Props extends Omit<ModalComponentData, 'type'|'components'> {
        children?: JSX.SingleOrArray<
            |APIModalInteractionResponseCallbackComponent
            |JSONEncodable<APIModalInteractionResponseCallbackComponent>
        >;
    }
}
