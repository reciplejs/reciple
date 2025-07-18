import { escapeRegexp } from '@reciple/utils';
import { parseArgs } from 'node:util';
import type { MessageCommand } from '../commands/MessageCommand.js';
import split from 'split-string';

export class MessageCommandParser implements MessageCommandParser.Data {
    public raw: string;
    public separator: string;
    public prefix: string;
    public args: string[] = [];
    public flags: MessageCommandParser.FlagData[] = [];

    get separatorRegex(): RegExp {
        return new RegExp(`${escapeRegexp(this.separator)}+`);
    }

    get rawWithoutPrefix() {
        return (this.prefix ? this.raw.slice(this.prefix.length) : this.raw).trim();
    }

    get name() {
        return this.rawWithoutPrefix.split(this.separatorRegex)[0].toLowerCase()
    }

    get rawArgs() {
        return this.rawWithoutPrefix.slice(this.name.length).trim();
    }

    public constructor(public readonly options: MessageCommandParser.Options) {
        this.raw = options.raw;
        this.separator = options.separator ?? ' ';
        this.prefix = options.prefix ?? '';
    }

    public parse(command: MessageCommand): this {
        this.args = MessageCommandParser.splitstring(this.rawArgs, {
            brackets: true,
            quotes: true,
            separator: this.separator,
            ...this.options.splitOptions,
        });

        const { positionals: args, values: flags } = parseArgs({
            args: this.args,
            allowPositionals: true,
            allowNegative: true,
            strict: false,
            options: Object.fromEntries(
                command.flags
                    .map((o) => [
                        o.name,
                        Object.fromEntries(
                            Object.entries({
                                type: o.valueType ?? 'string',
                                multiple: o.multiple,
                                short: o.shortcut,
                                default: o.multiple ? o.defaultValues : o.defaultValues?.[0],
                            })
                            .filter(([key, value]) => value !== undefined)
                        ) as any
                    ])
            ),
        });

        this.args = args;
        this.flags = Object
            .entries(flags)
            .filter(([_, value]) => value !== undefined)
            .map(([name, value]) => ({
                name,
                value: Array.isArray(value) ? value : [value.toString()],
            }))

        return this;
    }
}

export namespace MessageCommandParser {
    export interface Data {
        name: string;
        flags: FlagData[];
        args: string[];
        raw: string;
        rawArgs: string;
        separator: string;
        prefix: string;
    }

    export interface FlagData {
        name: string;
        value: (string|boolean)[];
    }

    export interface Options {
        raw: string;
        separator?: string;
        prefix?: string;
        splitOptions?: SplitOptions;
    }

    export interface SplitASTNode {
        type: 'root' | 'bracket';
        nodes: SplitASTNode[];
        stash: string[];
    }

    export interface SplitState {
        input: string;
        separator: string;
        stack: SplitASTNode[];
        bos(): boolean;
        eos(): boolean;
        prev(): string;
        next(): string;
    }

    export interface SplitOptions {
        brackets?: { [key: string]: string } | boolean;
        quotes?: string[] | boolean;
        separator?: string;
        strict?: boolean;
        keep?(value: string, state: SplitState): boolean;
    }

    export const splitstring: (input: string, options?: SplitOptions) => string[] = split as unknown as typeof split.default;
}
