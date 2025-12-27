import { Command } from 'commander';
import { CLISubcommand } from '../../classes/cli/CLISubcommand.js';
import { ConfigReader } from '../../classes/cli/ConfigReader.js';
import type { StartSubcommand } from './start.js';
import { Logger } from '@prtty/print';
import { resolveEnvProtocol } from '@reciple/utils';
import { colors } from '@prtty/prtty';
import { CLI } from '../../classes/cli/CLI.js';
import { build } from 'tsdown';
import { ShardingManager } from 'discord.js';
import { EventListeners } from '../../classes/client/EventListeners.js';

export default class StartShardingSubcommand extends CLISubcommand {
    public parent?: string = 'start';

    public subcommand: Command = new Command('sharding')
        .description('Start the reciple client in sharding mode')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
        .option('-b, --build', 'Build the modules before starting the client')
        .allowUnknownOption(true);

    public async execute(): Promise<void> {
        process.env.RECIPLE_SHARDING = 'true';
        process.env.RECIPLE_FIRST_SHARD = 'true';

        const recipleFlags = this.cli.getFlags();
        const flags = this.subcommand.opts<ShardingSubcommand.Flags>();

        const shardArgs: string[] = [
            ...CLI.stringifyFlags(recipleFlags, this.cli.command),
            'start',
            ...CLI.stringifyFlags(flags, this.command)
        ];

        const configReader = new ConfigReader(
            flags.config
            ?? await ConfigReader.find()
            ?? ConfigReader.createConfigFilename('js')
        );

        const { config, build: buildConfig, sharding } = await configReader.read();

        const logger = config.logger instanceof Logger ? this.cli.logger = config.logger : this.cli.logger.clone(config.logger);

        logger.label = 'ShardingManager';

        let token = flags.token || config.token || '';
            token = resolveEnvProtocol(token) || token;

        logger.log(colors.magenta(`⚡ Initializing reciple sharding manager!`));

        const processErrorLogger = (err: any) => {
            logger?.error(err);
            process.exit(1);
        };

        process.once('uncaughtException', processErrorLogger);
        process.once('unhandledRejection', processErrorLogger);
        process.on('warning', warn => logger.warn(warn));

        if (flags.build) {
            let plugins = buildConfig.plugins
                ? Array.isArray(buildConfig.plugins)
                    ? buildConfig.plugins
                    : [buildConfig.plugins]
                : [];

            plugins.push(CLI.createTsdownLogger());

            await build({
                ...buildConfig,
                logLevel: 'silent',
                plugins,
            });
        }

        if (!sharding) {
            logger.error('Sharding is not enabled in the config file');
            process.exit(1);
        }

        Reflect.set(global, 'useLogger', () => logger);

        const eventListeners = new EventListeners();
        const manager = new ShardingManager(CLI.bin, {
            ...sharding,
            token: token,
            shardArgs
        });

        manager.on('shardCreate', shard => {
            logger.log(colors.magenta(`🚀 Launched shard ${colors.green(String(shard.id))}`));

            shard.on('ready', () => {
                logger.log(colors.magenta(`✅ Shard ${colors.green(String(shard.id))} is ready!`));

                if (process.env.RECIPLE_FIRST_SHARD === 'true') {
                    process.env.RECIPLE_FIRST_SHARD = 'false';
                }
            });

            shard.on('reconnecting', () => {
                logger.log(colors.magenta(`🔄 Shard ${colors.green(String(shard.id))} is reconnecting...`));
            });

            shard.on('resume', () => {
                logger.log(colors.magenta(`✅ Shard ${colors.green(String(shard.id))} has resumed!`));
            });

            shard.on('disconnect', () => {
                logger.log(colors.magenta(`🛑 Shard ${colors.green(String(shard.id))} is disconnected!`));
            });

            shard.on('death', () => {
                logger.error(`🛑 Shard ${colors.green(String(shard.id))} has died!`);
            });

            shard.on('error', error => {
                logger.error(`❌ Shard ${colors.green(String(shard.id))} encountered an error:`, error);
            });

            shard.on('message', message => {
                // TODO: Handle shard messages
            });
        });

        eventListeners.registerProcessExitEvents(signal => this.destroyShardingManager(manager));

        await manager.spawn();
    }

    public destroyShardingManager(manager: ShardingManager): void {
        const logger = useLogger();

        manager.shards.map(s => {
            logger.log(colors.magenta(`🚧 Destroying shard ${s.id}`));

            if (s.process) {
                s.process.kill();
            } else {
                s.kill();
            }

            logger.log(colors.magenta(`🛑 Destroyed shard ${s.id}`));
        });

        logger.log(colors.magenta(`🚨 Destroyed all shards`));
        setTimeout(() => process.exit(0), 500);
    }
}

export namespace ShardingSubcommand {
    export interface Flags extends StartSubcommand.Flags {}
}
