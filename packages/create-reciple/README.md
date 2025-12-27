<div align="center">
    <img src="https://i.imgur.com/C3gWxwc.png" width="50%">
    <p align="center">
        <b>A Discord.js framework that just works.</b>
    </p>
    <br>
</div>

<h3 align="center">
    <a href="https://discord.gg/KxfPZYuTGV">
        <img src="https://img.shields.io/discord/1453743492722458708?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/create-reciple">
        <img src="https://img.shields.io/npm/v/create-reciple?label=npm">
    </a>
    <a href="https://github.com/reciplejs/reciple/tree/main/packages/create-reciple">
        <img src="https://img.shields.io/npm/dt/create-reciple?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/reciplejs/reciple">
        <img src="https://www.codefactor.io/repository/github/reciplejs/reciple/badge">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.gg/KxfPZYuTGV">
            <img src="http://invidget.switchblade.xyz/KxfPZYuTGV">
        </a>
    </div>
</h3>

## About

`create-reciple` An command alias for `reciple create`. Creates a new reciple project from a template.

## Usage

```bash
npm create reciple@latest
yarn dlx create-reciple@latest
pnpx create-reciple@latest
bunx create-reciple@latest
deno run -A npm:create-reciple@latest
```

## Help

```
Usage: reciple create [options] [command] [output]

Create a new reciple project

Arguments:
  output                        The directory to create the project in

Options:
  -c, --config <path>           Path to the configuration file
  -t, --token <DiscordToken>    Set your Discord Bot token
  -T, --typescript              Use TypeScript
  -p, --package-manager <name>  The name of the package manager to use (choices: "npm", "yarn", "pnpm", "bun", "deno")
  -D, --default                 Use defaults for prompts
  --install                     Install dependencies during setup (default: true)
  --no-install                  Do not install dependencies during setup
  --build                       Build the project after creation (default: true)
  --no-build                    Do not build the project after creation
  -h, --help                    display help for command

Commands:
  module [options] [output]     Creates new module
```

## Links

- [Website](https://reciple.js.org)
- [Discord](https://discord.gg/KxfPZYuTGV)
- [Github](https://github.com/reciplejs/reciple/tree/main/packages/create-reciple)
- [NPM](https://npmjs.org/package/create-reciple)
