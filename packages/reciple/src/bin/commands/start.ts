import { Command } from 'commander';
import { CLISubcommand } from '../../classes/cli/CLISubcommand.js';
import { ConfigReader } from '../../classes/cli/ConfigReader.js';
import { Logger } from 'prtyprnt';
import { colors, Format, resolveEnvProtocol } from '@reciple/utils';
import { Client, CommandType } from '@reciple/core';
import { ModuleLoader } from '../../classes/client/ModuleLoader.js';
import { ModuleManager } from '../../classes/managers/ModuleManager.js';
import { version as DiscordJsVersion } from 'discord.js';
import { EventListeners } from '../../classes/client/EventListeners.js';
import { RuntimeEnvironment } from '../../classes/cli/RuntimeEnvironment.js';
import { build } from 'tsdown';
import { CLI } from '../../classes/cli/CLI.js';

export default class StartSubcommand extends CLISubcommand {
    public subcommand: Command = new Command('start')
        .description('Start the reciple client')
        .option('-c, --config <path>', 'Path to the configuration file')
        .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
        .option('-b, --build', 'Build the modules before starting the client')
        .allowUnknownOption(true);

    public async execute(): Promise<void> {
        const flags = this.subcommand.opts<StartSubcommand.Flags>();
        const configReader = new ConfigReader(
            flags.config
            ?? await ConfigReader.findConfig(process.cwd())
            ?? ConfigReader.createConfigFilename('js')
        );

        const { client, config, build: buildConfig } = await configReader.read({
            createIfNotExists: false
        });

        const logger = config.logger instanceof Logger ? this.cli.logger = config.logger : this.cli.logger.clone(config.logger);

        let token = flags.token || config.token || '';
            token = resolveEnvProtocol(token) || token;

        function handleProcessError(err: unknown) {
            logger.error(err);
            process.exit(1);
        }

        process.once('uncaughtException', handleProcessError);
        process.once('unhandledRejection', handleProcessError);
        process.on('warning', warn => logger.warn(warn));

        logger.log(colors.magenta(`⚡ Initializing reciple!`));

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

        Reflect.set(global, 'useClient', () => client);
        Reflect.set(global, 'useLogger', () => logger);

        EventListeners.registerLoggerEventListeners(client);

        logger.log(colors.green(`📦 Version Info:`));
        logger.log(` ├─ ${colors.cyan(`reciple`)}\t\t${colors.yellow(`${this.cli.version}`)}`);
        logger.log(` ├─ ${colors.cyan(`@reciple/client`)}\t${colors.yellow(`${Client.version}`)}`);
        logger.log(` └─ ${colors.cyan(`discord.js`)}\t${colors.yellow(`${DiscordJsVersion}`)}`);

        const modules = await client.moduleLoader.findModules();

        Object.assign(client, {
            _onBeforeLogin: async() => {
                const enabledModules = await client.modules.enableModules({ modules });

                client.once('clientReady', async() => {
                    if (!client.isReady()) return;

                    EventListeners.registerCommandsEventListeners(client);

                    logger.debug(`Client is ready!`);
                    process.removeListener('uncaughtException', handleProcessError);
                    process.removeListener('unhandledRejection', handleProcessError);

                    const notEnabledModules = modules.length - enabledModules.length;
                    logger.log(colors.green(`✅ ${enabledModules.length} ${Format.plural(enabledModules.length, 'module')} ${Format.plural(enabledModules.length, 'is', 'are')} enabled.${notEnabledModules > 0 ? colors.red(` (${notEnabledModules} not enabled)`) : ''}`));

                    const readyModules = await client.modules.readyModules();
                    const notReadyModules = readyModules.length - enabledModules.length;

                    logger.log(colors.green(`✅ ${readyModules.length} ${Format.plural(readyModules.length, 'module')} ${Format.plural(readyModules.length, 'is', 'are')} ready.${notReadyModules > 0 ? colors.red(` (${notReadyModules} not ready)`) : ''}`));

                    await client.commands.registerApplicationCommands({
                        ...config.applicationCommandsRegister,
                        commands: client.commands.applicationCommands,
                    });

                    process.stdin.resume();

                    const commands = {
                        contextMenus: client.commands.cache.filter(c => c.type === CommandType.ContextMenu).size,
                        message: client.commands.cache.filter(c => c.type === CommandType.Message).size,
                        slash: client.commands.cache.filter(c => c.type === CommandType.Slash).size
                    };

                    logger.log(`🔑 Logged in as ${colors.bold(colors.cyan(client.user.displayName))} ${colors.magenta(`(${client.user.id})`)}`);
                    logger.log(` ├─ Loaded ${colors.green(modules.length)} ${Format.plural(modules.length, 'module')}.`);
                    logger.log(` ├─ Loaded ${colors.green(commands.contextMenus)} context menu ${Format.plural(commands.contextMenus, 'command')}.`);
                    logger.log(` ├─ Loaded ${colors.green(commands.message)} message ${Format.plural(commands.message, 'command')}.`);
                    logger.log(` ├─ Loaded ${colors.green(commands.slash)} slash ${Format.plural(commands.slash, 'command')}.`);
                    logger.log(` ├─ Loaded ${colors.green(client.preconditions.cache.size)} global ${Format.plural(client.preconditions.cache.size, 'precondition')}.`);
                    logger.log(` └─ Loaded ${colors.green(client.postconditions.cache.size)} global ${Format.plural(client.postconditions.cache.size, 'postcondition')}.`);
                });

                client.eventListeners.registerProcessExitEvents(async signal => RuntimeEnvironment.handleExitSignal(client, signal));
            },
            _onBeforeDestroy: async (client: Client) => {
                await client.modules.disableModules();
            }
        })

        logger.debug(`Logging in...`);
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
