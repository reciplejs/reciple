import type { Logger } from 'prtyprnt';
import type { CLI } from './classes/CLI.js';
import type { ModuleLoader } from './classes/ModuleLoader.js';

declare module "@reciple/core" {
    interface Config {
        modules?: ModuleLoader.Config;
    }

    interface Client {
        readonly moduleLoader: ModuleLoader;
        readonly cli: CLI;
        logger: Logger;
    }
}

export * from '@reciple/core';
export * as Prtyprnt from 'prtyprnt';
