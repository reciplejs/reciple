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
const out = process.argv[2];
const root = app.options.getValue('basePath') || '.';

if (!project) {
    console.error('No project found');
    process.exit(1);
}

const json = new ProjectParser({
    data: app.serializer.projectToObject(project, root),
    dependencies: {}
});

process.stdout.write(JSON.stringify(json));

if (out) {
    mkdir(path.dirname(out), { recursive: true });
    writeFile(out, JSON.stringify(json));
}

process.exit(0);
