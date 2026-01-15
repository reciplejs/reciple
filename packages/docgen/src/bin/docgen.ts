import { ProjectParser } from '@catplvsplus/typedoc-json-parser';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';

const app = await Application.bootstrapWithPlugins({}, [
    new TypeDocReader(),
    new TSConfigReader()
]);

const project = await app.convert();

const documentation = new ProjectParser({
    data: app.serializer.toObject(project),
    dependencies: {}
});

process.stdout.write(JSON.stringify(documentation, null, 2));
process.exit(0);
