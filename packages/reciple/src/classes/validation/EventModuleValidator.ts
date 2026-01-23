import { Validator } from '@reciple/core';
import { EventEmitter } from 'node:events';
import { BaseModuleValidator } from './BaseModuleValidator.js';
import type { EventModule } from '../modules/events/EventModule.js';

export class EventModuleValidator extends Validator {
    public static emitter = Validator.s.instance(EventEmitter);
    public static event = Validator.s.string();
    public static once = Validator.s.boolean().optional();
    public static onEvent = Validator.s.instance(Function);

    public static object = BaseModuleValidator.object.extend({
        emitter: EventModuleValidator.emitter,
        event: EventModuleValidator.event,
        once: EventModuleValidator.once,
        onEvent: EventModuleValidator.onEvent
    });

    public static resolvable = EventModuleValidator.s.union([EventModuleValidator.object, EventModuleValidator.jsonEncodable]);

    public static isValidEmitter(emitter: unknown): asserts emitter is EventEmitter {
        EventModuleValidator.emitter.setValidationEnabled(EventModuleValidator.isValidationEnabled).parse(emitter);
    }

    public static isValidEvent(event: unknown): asserts event is string {
        EventModuleValidator.event.setValidationEnabled(EventModuleValidator.isValidationEnabled).parse(event);
    }

    public static isValidOnce(once: unknown): asserts once is boolean {
        EventModuleValidator.once.setValidationEnabled(EventModuleValidator.isValidationEnabled).parse(once);
    }

    public static isValidOnEvent(onEvent: unknown): asserts onEvent is (...args: unknown[]) => Promise<void> {
        EventModuleValidator.onEvent.setValidationEnabled(EventModuleValidator.isValidationEnabled).parse(onEvent);
    }

    public static isValid(value: unknown): asserts value is EventModule.Data {
        const data = value as EventModule;

        BaseModuleValidator.isValid(data);
        EventModuleValidator.isValidEmitter(data.emitter);
        EventModuleValidator.isValidEvent(data.event);
        EventModuleValidator.isValidOnce(data.once);
        EventModuleValidator.isValidOnEvent(data.onEvent);
    }
}
