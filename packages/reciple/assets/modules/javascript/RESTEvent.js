// @ts-check
import { RESTEventModule } from "reciple";

export class $MODULE_NAME$ extends RESTEventModule {
    event = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent(...args) {
        // Your code
    }
}

export default new $MODULE_NAME$();
