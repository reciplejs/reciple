// @ts-check
import { ClientEventModule } from "reciple";

export class $MODULE_NAME$ extends ClientEventModule {
    event = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent(...args) {
        // Your code
    }
}

export default new $MODULE_NAME$();
