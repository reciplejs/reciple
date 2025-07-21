import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
    entry: ['src/**/*.{ts,tsx}'],
    esbuildPlugins: [esbuildPluginVersionInjector()],
    bundle: false
});
