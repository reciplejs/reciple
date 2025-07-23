import { Button as ButtonComponent } from "./components/Button.js";
import { Modal as ModalComponent } from "./components/Modal.js";
import { ChannelSelectMenu as ChannelSelectMenuComponent } from './components/ChannelSelectMenu.js';
import { RoleSelectMenu as RoleSelectMenuComponent } from './components/RoleSelectMenu.js';
import { StringSelectMenu as StringSelectMenuComponent } from './components/StringSelectMenu.js';
import { UserSelectMenu as UserSelectMenuComponent } from './components/UserSelectMenu.js';

export namespace Interactive {
    export const Button = ButtonComponent;

    export const Modal = ModalComponent;

    export const ChannelSelectMenu = ChannelSelectMenuComponent;
    export const RoleSelectMenu = RoleSelectMenuComponent;
    export const StringSelectMenu = StringSelectMenuComponent;
    export const UserSelectMenu = UserSelectMenuComponent;
}
