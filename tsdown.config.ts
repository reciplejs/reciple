import { defineConfig, type UserConfig } from 'tsdown';
import { replacePlugin } from 'rolldown/plugins';
import path from 'node:path';

const packageJSON = await import(`file://${path.join(process.cwd(), 'package.json')}`, { with: { type: 'json' } }).then(m => m.default);

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
        plugins: [
            replacePlugin({
                'process.env.__VERSION__': `"${packageJSON.version}"`
            })
        ],
        ...options
	});
}
