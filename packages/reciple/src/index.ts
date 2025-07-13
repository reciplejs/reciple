import type { CLI } from './classes/CLI.js';
import type { ModuleLoader } from './classes/ModuleLoader.js';

declare module "@reciple/core" {
    interface Config {
        modules?: ModuleLoader.Config;
    }

    interface Client {
        moduleLoader: ModuleLoader;
        cli: CLI;
    }
}

export * from '@reciple/core';
