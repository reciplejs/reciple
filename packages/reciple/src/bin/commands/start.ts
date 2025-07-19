import { Command } from 'commander';
import { CLISubcommand } from '../../classes/CLISubcommand.js';
import { ConfigReader } from '../../classes/ConfigReader.js';
import { Logger } from 'prtyprnt';
import { colors, resolveEnvProtocol } from '@reciple/utils';
import { Client, CommandType } from '@reciple/core';
import { ModuleLoader } from '../../classes/ModuleLoader.js';
import { ModuleManager } from '../../classes/managers/ModuleManager.js';
import { version as DiscordJsVersion } from 'discord.js';
import { EventListeners } from '../../classes/EventListeners.js';
import { RuntimeEnvironment } from '../../classes/RuntimeEnvironment.js';

export default class StartSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('start')
        .description('Start the reciple client')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
        .allowUnknownOption(true);

    public async execute(): Promise<void> {
        const flags = this.subcommand.opts<StartSubcommand.Flags>();
        const configReader = new ConfigReader(
            flags.config
            ?? await ConfigReader.findConfigFromDirectory(process.cwd())
            ?? ConfigReader.createConfigFilename('js')
        );

        const { client, config } = await configReader.read({
            createIfNotExists: false
        });

        const logger = config.logger instanceof Logger ? config.logger : this.cli.logger.clone(config.logger);

        let token = flags.token || config.token || '';
            token = resolveEnvProtocol(token) || token;

        function handleProcessError(err: unknown) {
            logger.error(err);
            process.exit(1);
        }

        process.once('uncaughtException', handleProcessError);
        process.once('unhandledRejection', handleProcessError);
        process.on('warning', warn => logger.warn(warn));

        Object.assign(client, {
            logger,
            cli: this.cli,
            config
        });

        Object.assign(client, {
            modules: new ModuleManager(client),
            moduleLoader: new ModuleLoader(client),
            eventListeners: new EventListeners()
        });

        Reflect.set(global, 'getClient', () => client);

        EventListeners.registerLoggerEventListeners(client);

        logger.log(`Starting reciple...`);
        logger.log(colors.bold(`Version Info:`));
        logger.log(`├─${colors.green(`reciple`)}${colors.cyan(`@${this.cli.version}`)}`);
        logger.log(`├─${colors.green(`@reciple/client`)}${colors.cyan(`@${Client.version}`)}`);
        logger.log(`└─${colors.green(`discord.js`)}${colors.cyan(`@${DiscordJsVersion}`)}`);

        const modules = await client.moduleLoader.findModules();

        Object.assign(client, {
            _onBeforeLogin: async() => {
                const enabledModules = await client.modules.enableModules({ modules });

                client.once('ready', async() => {
                    if (!client.isReady()) return;

                    logger.debug(`Client is ready!`);
                    process.removeListener('uncaughtException', handleProcessError);
                    process.removeListener('unhandledRejection', handleProcessError);

                    const notEnabledModules = modules.length - enabledModules.length;
                    logger.log(`Enabled ${colors.green(enabledModules.length)} modules.${notEnabledModules > 0 ? colors.red(` (${notEnabledModules} not enabled)`) : ''}`);

                    const readyModules = await client.modules.readyModules();
                    const notReadyModules = readyModules.length - enabledModules.length;

                    logger.log(`Ready ${colors.green(readyModules.length)} modules.${notReadyModules > 0 ? colors.red(` (${notReadyModules} not ready)`) : ''}`);
                    logger.log(`Client is logged in as ${colors.bold(colors.cyan(client.user.displayName))} ${colors.magenta(`(${client.user.id})`)}`);

                    process.stdin.resume();

                    logger.log(`Loaded ${colors.green(modules.length)} modules.`);
                    logger.log(`Loaded ${colors.green(client.commands.cache.filter(c => c.type === CommandType.ContextMenu).size)} context menu commands.`);
                    logger.log(`Loaded ${colors.green(client.commands.cache.filter(c => c.type === CommandType.Message).size)} message commands.`);
                    logger.log(`Loaded ${colors.green(client.commands.cache.filter(c => c.type === CommandType.Slash).size)} slash commands.`);
                    logger.log(`Loaded ${colors.green(client.preconditions.cache.size)} global preconditions.`);
                    logger.log(`Loaded ${colors.green(client.postconditions.cache.size)} global postconditions.`);
                });

                client.eventListeners.registerProcessExitEvents(async signal => RuntimeEnvironment.handleExitSignal(client, signal));
            },
            _onBeforeDestoy: (client: Client) => {
                client.modules.disableModules();
                client.eventListeners.unregisterAll();
            }
        })

        logger.debug(`Logging using token: ${token}`);
        await client.login(token);
    }
}

export namespace StartSubcommand {
    export interface Flags {
        config?: string;
        token?: string;
        build?: boolean;
    }
}
