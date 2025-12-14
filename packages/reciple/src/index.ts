import type { Client } from '@reciple/core';
import { logger, type Logger } from '@prtty/print';

export * from './classes/NotAnError.js';

export * from './classes/cli/CLI.js';
export * from './classes/cli/CLISubcommand.js';
export * from './classes/cli/ConfigReader.js';
export * from './classes/cli/RuntimeEnvironment.js';

export * from './classes/client/EventListeners.js';
export * from './classes/client/ModuleLoader.js';

export * from './classes/managers/ModuleManager.js';

export * from './classes/modules/BaseModule.js';
export * from './classes/modules/commands/ContextMenuCommandModule.js';
export * from './classes/modules/commands/MessageCommandModule.js';
export * from './classes/modules/commands/SlashCommandModule.js';
export * from './classes/modules/events/ClientEventModule.js';
export * from './classes/modules/events/EventModule.js';
export * from './classes/modules/events/RESTEventModule.js';
export * from './classes/modules/PostconditionModule.js';
export * from './classes/modules/PreconditionModule.js';

export * from './classes/templates/ModuleTemplateBuilder.js';
export * from './classes/templates/TemplateBuilder.js';

export * from './classes/validation/BaseModuleValidator.js';
export * from './classes/validation/CommandModuleValidator.js';
export * from './classes/validation/EventModuleValidator.js';
export * from './classes/validation/PostconditionModule.js';
export * from './classes/validation/PreconditionModule.js';

export * from './helpers/constants.js';
export * from './helpers/types.js';

export * from '@reciple/core';
export * as PrttyPrint from '@prtty/print';

globalThis.useClient = () => {
    throw new Error('Client is not yet loaded.');
};

globalThis.useLogger = () => logger

declare global {
    var useClient: () => Client;
    var useLogger: () => Logger;
}
