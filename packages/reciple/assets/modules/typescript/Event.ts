import { EventModule } from "reciple";

export class $MODULE_NAME$ extends EventModule {
    // @ts-expect-error
    public emitter = $EVENT_EMITTER$;
    public event = '$EVENT_NAME$';
    // @ts-expect-error
    public once = $EVENT_ONCE$;

    // @ts-expect-error
    public onEvent(...args): void {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
