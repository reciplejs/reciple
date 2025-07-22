import shellQuote from 'shell-quote';

export class PackageManager {
    get commands(): Record<PackageManager.CommandType, string> {
        return PackageManager.commands[this.type];
    }

    constructor(public type: PackageManager.Type = PackageManager.getNPMUserAgent() ?? 'npm') {}

    public setType(type: PackageManager.Type): void {
        this.type = type;
    }

    public install(packages: string[], options?: PackageManager.InstallOptions): string {
        const flags: string[] = [];

        if (options?.dev) flags.push('-D');
        if (options?.denoUseNPM !== false && this.type === 'deno') flags.push('--use-npm');
        if (options?.denoAllowScripts !== false && this.type === 'deno') flags.push('--allow-scripts');

        return `${this.commands.install} ${packages.join(' ')} ${flags.join(' ')}`.trim();
    }

    public remove(packages: string[]): string {
        return `${this.commands.remove} ${packages.join(' ')}`;
    }

    public installAll(): string {
        return this.commands.installAll;
    }

    public run(script: string): string {
        return `${this.commands.run} ${shellQuote.quote([script])}`;
    }
}

export namespace PackageManager {
    export type Type = 'npm'|'yarn'|'pnpm'|'bun'|'deno';
    export type CommandType = 'install'|'remove'|'installAll'|'run'|'exec';

    export interface InstallOptions {
        dev?: boolean;
        denoUseNPM?: boolean;
        denoAllowScripts?: boolean;
    }

    export const all: Type[] = ['npm', 'yarn', 'pnpm', 'bun', 'deno'];

    export function getNPMUserAgent(): PackageManager.Type|null {
        const npmConfigUserAgent = process.env.npm_config_user_agent?.toLowerCase();
        if (!npmConfigUserAgent) return null;

        if (npmConfigUserAgent.startsWith('npm')) return 'npm';
        if (npmConfigUserAgent.startsWith('yarn')) return 'yarn';
        if (npmConfigUserAgent.startsWith('pnpm')) return 'pnpm';
        if (npmConfigUserAgent.startsWith('bun')) return 'bun';
        if (npmConfigUserAgent.startsWith('deno')) return 'deno';

        return null;
    }

    export const commands: Record<Type, Record<CommandType, string>> = {
        npm: {
            install: 'npm install',
            remove: 'npm uninstall',
            installAll: 'npm install',
            run: 'npm run',
            exec: 'npm exec'
        },
        yarn: {
            install: 'yarn add',
            remove: 'yarn remove',
            installAll: 'yarn install',
            run: 'yarn run',
            exec: 'yarn exec'
        },
        pnpm: {
            install: 'pnpm add',
            remove: 'pnpm remove',
            installAll: 'pnpm install',
            run: 'pnpm run',
            exec: 'pnpm exec'
        },
        bun: {
            install: 'bun add',
            remove: 'bun remove',
            installAll: 'bun install',
            run: 'bun run',
            exec: 'bun x'
        },
        deno: {
            install: 'deno add',
            remove: 'deno uninstall',
            installAll: 'deno install',
            run: 'deno task',
            exec: 'deno run -A npm:'
        }
    };
}
