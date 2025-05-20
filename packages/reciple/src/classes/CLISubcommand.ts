import type { Command } from 'commander';
import type { CLI } from './CLI.js';

export abstract class CLISubcommand<Flags extends Record<string, any> = Record<string, any>> {
    public cli: CLI;
    public command: Command;
    public abstract subcommand: Command;

    get flags(): Flags {
        return this.cli.getFlags(this.subcommand) ?? {} as Flags;
    }

    public constructor({ cli, command }: CLISubcommand.Options) {
        this.cli = cli;
        this.command = command;
    }

    public async execute(): Promise<void> {}

    public static registerSubcommand(instance: CLISubcommand): void {
        instance.subcommand.action(instance.execute.bind(instance));
        instance.command.addCommand(instance.subcommand);
    }
}

export namespace CLISubcommand {
    export type Constructor = new (options: Options) => CLISubcommand;
    export interface Options {
        cli: CLI;
        command: Command;
    }
}
