import type { AnySelectMenuInteraction, AutocompleteInteraction, Awaitable, ButtonInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, Interaction, ModalSubmitInteraction, PrimaryEntryPointCommandInteraction } from 'discord.js';
import type { InteractionListenerType } from './constants.js';

export interface InteractionListenerData<T extends InteractionListenerType = InteractionListenerType> {
    type: T;
    once?: boolean;
    filter?: (interaction: InteractionFromListenerType<T>) => Awaitable<boolean>;
    execute: (interaction: InteractionFromListenerType<T>) => Awaitable<void>;
}

export type AnyCommandInteraction = AutocompleteInteraction|ChatInputCommandInteraction|ContextMenuCommandInteraction|PrimaryEntryPointCommandInteraction;
export type AnyComponentInteraction = ButtonInteraction|ModalSubmitInteraction|AnySelectMenuInteraction;

export type InteractionFromListenerType<T extends InteractionListenerType> = T extends InteractionListenerType.Autocomplete
    ? AutocompleteInteraction
    : T extends InteractionListenerType.ChatInput
        ? ChatInputCommandInteraction
        : T extends InteractionListenerType.ContextMenu
            ? ContextMenuCommandInteraction
            : T extends InteractionListenerType.Button
                ? ButtonInteraction
                : T extends InteractionListenerType.ModalSubmit
                    ? ModalSubmitInteraction
                    : T extends InteractionListenerType.SelectMenu
                        ? AnySelectMenuInteraction
                        : T extends InteractionListenerType.PrimaryEntryPoint
                            ? PrimaryEntryPointCommandInteraction
                            : Interaction;

export type ListenerTypeFromInteraction<T extends InteractionFromListenerType<InteractionListenerType>> = T extends AutocompleteInteraction
    ? InteractionListenerType.Autocomplete
    : T extends ChatInputCommandInteraction
        ? InteractionListenerType.ChatInput
        : T extends ContextMenuCommandInteraction
            ? InteractionListenerType.ContextMenu
            : T extends ButtonInteraction
                ? InteractionListenerType.Button
                : T extends ModalSubmitInteraction
                    ? InteractionListenerType.ModalSubmit
                    : T extends AnySelectMenuInteraction
                        ? InteractionListenerType.SelectMenu
                        : T extends PrimaryEntryPointCommandInteraction
                            ? InteractionListenerType.PrimaryEntryPoint
                            : InteractionListenerType;
