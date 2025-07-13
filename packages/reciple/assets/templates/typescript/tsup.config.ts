import { defineConfig } from 'tsup';
import { replaceTscAliasPaths } from 'tsc-alias';

export default defineConfig({
    entry: ['src/**/*.{ts,tsx}'],
    outDir: './modules',
    tsconfig: './tsconfig.json',
    external: [],
    noExternal: [],
    esbuildPlugins: [],
    platform: 'node',
    format: 'esm',
    clean: true,
    minify: false,
    bundle: false,
    dts: false,
    splitting: false,
    keepNames: true,
    sourcemap: true,
    treeshake: true,
    onSuccess: () => replaceTscAliasPaths({
        configFile: './tsconfig.json'
    }),
});
