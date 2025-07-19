// @ts-check
import { EventModule } from "reciple";

export class $MODULE_NAME$ extends EventModule {
    // @ts-expect-error
    emitter = $EVENT_EMITTER$;
    event = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent(...args) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
