---
title: Hello World
description: Hello World
---

# Terminal Environment Changes

## Extension: ms-python.python

- `PYTHONSTARTUP=/home/vin/.config/Code/User/workspaceStorage/8d6a0ddbe8c53c3a072784271c49e525/ms-python.python/pythonrc.py`
- `PYTHON_BASIC_REPL=1`

## Extension: vscode.git

Enables the following features: git auth provider

- `GIT_ASKPASS=/usr/share/code/resources/app/extensions/git/dist/askpass.sh`
- `VSCODE_GIT_ASKPASS_NODE=/usr/share/code/code`
- `VSCODE_GIT_ASKPASS_EXTRA_ARGS=`
- `VSCODE_GIT_ASKPASS_MAIN=/usr/share/code/resources/app/extensions/git/dist/askpass-main.js`
- `VSCODE_GIT_IPC_HANDLE=/run/user/1000/vscode-git-ba9a2df2ee.sock`

## Extension: GitHub.copilot-chat

Enables use of `copilot-debug` and `copilot` commands in the terminal

- `PATH=/home/vin/.config/Code/User/globalStorage/github.copilot-chat/debugCommand:/home/vin/.config/Code/User/globalStorage/github.copilot-chat/copilotCli`

## Extension: GitHub.copilot

```js
import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
        vitePreprocess(),
        mdsvex({
            extensions: ['.svx', '.md']
        })
    ],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},

	extensions: ['.svelte', '.svx', '.md']
};

export default config;
```
