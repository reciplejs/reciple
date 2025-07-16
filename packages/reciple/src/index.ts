import type { Logger, LoggerOptions } from 'prtyprnt';
import type { CLI } from './classes/CLI.js';
import type { ModuleLoader } from './classes/ModuleLoader.js';
import type { ModuleManager } from './classes/managers/ModuleManager.js';

declare module "@reciple/core" {
    interface Config {
        token?: string;
        modules?: ModuleLoader.Config;
        logger?: Logger|LoggerOptions
    }

    interface Client {
        readonly modules: ModuleManager;
        readonly moduleLoader: ModuleLoader;
        readonly cli: CLI;
        logger: Logger;
    }
}

export * from '@reciple/core';
export * as Prtyprnt from 'prtyprnt';
