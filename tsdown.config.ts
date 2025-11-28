import { defineConfig, type UserConfig } from 'tsdown';

export function createTsdownConfig(options?: UserConfig) {
	return defineConfig({
		entry: ['src/index.ts'],
		external: ['reciple', /^@reciple\//],
		noExternal: [],
		platform: 'node',
		format: ['esm'],
		skipNodeModulesBundle: true,
		target: 'esnext',
		clean: true,
		minify: false,
		dts: true,
		sourcemap: true,
		treeshake: true,
		outDir: './dist',
        tsconfig: 'tsconfig.json',
        ...options
	});
}
