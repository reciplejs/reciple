import { Module } from '@reciple/core';

export class MyModule extends Module {
    public readonly id: string = 'my-module';

    public async onReady(data: Module.EventData<true>): Promise<void> {}
}
