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
    <a href="https://npmjs.org/package/@reciple/utils">
        <img src="https://img.shields.io/npm/v/@reciple/utils?label=npm">
    </a>
    <a href="https://github.com/reciplejs/reciple/tree/main/packages/utils">
        <img src="https://img.shields.io/npm/dt/@reciple/utils?maxAge=3600">
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

`@reciple/utils` A utility library used by reciple packages.

## Installation

```bash
npm install @reciple/utils
yarn add @reciple/utils
pnpm add @reciple/utils
bun install @reciple/utils
deno install npm:@reciple/utils
```

## Usage
```js
import { isDebugging, Format } from "@reciple/utils";

console.log(isDebugging() ? "Debugging" : "Not debugging"); // Not debugging
console.log(Format.bytes(1024 * 1024 * 1024)); // 1GB
console.log(Format.duration(1000 * 60 * 60 * 24)); // 1d
console.log(Format.plural(2, "hour")); // 2 hours
```

## Links

- [Website](https://reciple.js.org)
- [Discord](https://discord.gg/KxfPZYuTGV)
- [Github](https://github.com/reciplejs/reciple/tree/main/packages/utils)
- [NPM](https://npmjs.org/package/@reciple/utils)
