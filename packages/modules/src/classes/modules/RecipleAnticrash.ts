import { AttachmentBuilder, BaseChannel, codeBlock, Colors, EmbedBuilder, escapeCodeBlock, type Awaitable, type BaseMessageOptions as DJSBaseMessageOptions, type Message, type SendableChannels } from 'discord.js';
import { inspect } from 'node:util';
import { BaseModule } from 'reciple';

export class RecipleAnticrash extends BaseModule implements RecipleAnticrash.Options {
    public readonly id: string = 'org.reciple.js.anticrash';

    public baseReportMessageOptions?: RecipleAnticrash.Options['baseReportMessageOptions'];
    public reportChannels: string[] = [];

    private readonly logger = useLogger().clone({ label: 'Anticrash' });

    constructor(options?: RecipleAnticrash.Options) {
        super();

        Object.assign(this, options ?? {});

        this._captureErrorEvent = this._captureErrorEvent.bind(this);
    }

    public async onEnable(data: BaseModule.EventData<boolean>): Promise<void> {
        this.client.on('error', this._captureErrorEvent);
        this.client.on('shardError', this._captureErrorEvent);
        process.on('uncaughtException', this._captureErrorEvent);
        process.on('uncaughtExceptionMonitor', this._captureErrorEvent);
        process.on('unhandledRejection', this._captureErrorEvent);
    }

    public async onReady(data: BaseModule.EventData<true>): Promise<void> {}

    public async onDisable(data: BaseModule.EventData<boolean>): Promise<void> {
        this.client.off('error', this._captureErrorEvent);
        this.client.off('shardError', this._captureErrorEvent);
        process.off('uncaughtException', this._captureErrorEvent);
        process.off('uncaughtExceptionMonitor', this._captureErrorEvent);
        process.off('unhandledRejection', this._captureErrorEvent);
    }

    public async report(reason: any): Promise<RecipleAnticrash.Report[]> {
        const reports: RecipleAnticrash.Report[] = [];
        const stack = inspect(reason, { colors: false });

        this.logger.err(reason);

        for (const channelId of this.reportChannels) {
            const channel = await this.resolveChannel(channelId);
            if (!channel) continue;

            const message = await channel.send(await this.createReportMessageOptions(reason, stack)).catch(() => null);
            if (message) reports.push({ message, stackTrace: stack, timestamp: message.createdTimestamp });
        }

        return reports;
    }

    public async createReportMessageOptions(reason: any, stack: string): Promise<DJSBaseMessageOptions> {
        const base = typeof this.baseReportMessageOptions === 'function'
            ? await Promise.resolve(this.baseReportMessageOptions(reason)).catch(() => null)
            : this.baseReportMessageOptions ?? {};

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Anticrash report` })
            .setTitle(String(reason).substring(0, 100))
            .setColor(Colors.Red)
            .setTimestamp();

        let files: Exclude<DJSBaseMessageOptions['files'], undefined>[0][] = [...(base?.files ?? [])];

        if (stack.length < 1950) {
            embed.setDescription(codeBlock(escapeCodeBlock(stack)))
        } else {
            const file = new AttachmentBuilder(Buffer.from(stack, 'utf-8'), { name: 'report.log' });

            if (base?.replaceFiles) {
                files = [file];
            } else if (base?.replaceFiles === undefined || base?.replaceFiles === 'merge') {
                files.push(file);
            }
        }

        return {
            ...base,
            embeds: base?.replaceEmbeds
                ? [embed]
                : base?.replaceEmbeds === undefined || base?.replaceEmbeds === 'merge'
                    ? [...(base?.embeds ?? []), embed]
                    : base.embeds,
            files
        };
    }

    public async resolveChannel(resolvable: Exclude<RecipleAnticrash.Options['reportChannels'], undefined>[0]): Promise<SendableChannels|null> {
        if (resolvable instanceof BaseChannel) return resolvable;
        if (typeof resolvable === 'function') return Promise.resolve(resolvable()).catch(() => null);

        const id = typeof resolvable === 'string' ? resolvable : resolvable.id;
        const channel = await this.client.channels.fetch(id).catch(() => null);

        if (channel) {
            return channel.isSendable() ? channel : null;
        }

        const userDm = await this.client.users.fetch(id).catch(() => null);

        return userDm?.dmChannel ?? null;
    }

    private async _captureErrorEvent(...args: any[]): Promise<void> {
        if (args[0]) await this.report(args[0]);
    }
}

export namespace RecipleAnticrash {
    export interface Options {
        baseReportMessageOptions?: BaseMessageOptions|((reason: any) => Awaitable<BaseMessageOptions>);
        reportChannels?: (string|{ id: string; }|SendableChannels|(() => Awaitable<SendableChannels>))[];
    }

    export interface Report {
        message?: Message;
        stackTrace: string;
        timestamp: number;
    }

    export interface BaseMessageOptions extends DJSBaseMessageOptions {
        replaceEmbeds?: 'merge'|boolean;
        replaceFiles?: 'merge'|boolean;
    }
}
