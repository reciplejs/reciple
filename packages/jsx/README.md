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
    <a href="https://npmjs.org/package/@reciple/jsx">
        <img src="https://img.shields.io/npm/v/@reciple/jsx?label=npm">
    </a>
    <a href="https://github.com/reciplejs/reciple/tree/main/packages/jsx">
        <img src="https://img.shields.io/npm/dt/@reciple/jsx?maxAge=3600">
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

`@reciple/jsx` A JSX wrapper for [Discord.js](https://discord.js.org/) builders.

## Installation

```bash
npm install @reciple/jsx discord.js
yarn add @reciple/jsx discord.js
pnpm add @reciple/jsx discord.js
bun install @reciple/jsx discord.js
deno install npm:@reciple/jsx discord.js
```

## Configuration

You must set `react-jsx` as [**jsx**](https://www.typescriptlang.org/tsconfig#jsx) then set `@reciple/jsx` as [**jsxImportSource**](https://www.typescriptlang.org/tsconfig#jsxImportSource) to your tsconfig.json or bundler config to use components from `@reciple/jsx`.

```json
{
    "compilerOptions": {
        ...
        "jsx": "react-jsx",
        "jsxImportSource": "@reciple/jsx"
    }
}
```

## Usage
```js
await channel.send({
    embeds: [
        <Embed color="Blue" timestamp={null}>
            <EmbedTitle>My Embed</EmbedTitle>
            <EmbedDescription>Lorem ipsum dolor sit amet consectetur adipiscing elit</EmbedDescription>
            <EmbedImage url={"https://i.imgur.com/C3gWxwc.png"}/>
        </Embed>
    ]
});
```

## Links

- [Website](https://reciple.js.org)
- [Discord](https://discord.gg/KxfPZYuTGV)
- [Github](https://github.com/reciplejs/reciple/tree/main/packages/jsx)
- [NPM](https://npmjs.org/package/@reciple/jsx)
