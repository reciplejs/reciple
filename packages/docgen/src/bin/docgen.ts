#!/usr/bin/env node

import { ProjectParser } from '@catplvsplus/typedoc-json-parser';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';

const typedocConfig = new TypeDocReader();
const app = await Application.bootstrapWithPlugins({},[
    typedocConfig,
    new TSConfigReader()
]);

const project = await app.convert();

const json = new ProjectParser({
    data: app.serializer.toObject(project)!,
    dependencies: {}
});

const out = app.options.getValue('json');

if (out) {
    mkdir(path.dirname(out), { recursive: true });
    writeFile(out, JSON.stringify(json));
    process.exit(0);
}

process.stdout.write(JSON.stringify(json));
process.exit(0);
